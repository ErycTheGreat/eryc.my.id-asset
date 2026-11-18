// Flight recorder: saves what a bot was actually served.
//
// For each recorded bot visit it writes to an R2 bucket:
//   snapshots/<hash>.html           the exact bytes served (stored once per unique page)
//   visits/<day>/<bot>/<time>.json  one small record per visit (features + headers)
//
// This records what WE SENT. It cannot see what the bot's pipeline did afterwards.
// It never changes the response; callers hand it a clone of the response.
import { sha256Hex, extractFeatures, headerFingerprint, MAX_FEATURE_BYTES } from './fingerprint.js';

export const MAX_SNAPSHOT_BYTES = 400 * 1024;

const safe = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 40);

// `spec` is the AGP_RECORD_PATHS value: "*" for every path, otherwise a comma
// separated list of path prefixes, e.g. "/case-studies/,/about". Empty = off.
export function pathAllowed(spec, pathname) {
  if (!spec) return false;
  const items = String(spec).split(',').map((s) => s.trim()).filter(Boolean);
  if (items.includes('*')) return true;
  return items.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`) || pathname === p.replace(/\/$/, ''));
}

export function recorderEnabled(env, opts, pathname) {
  if (env.AGP_RECORD === 'off') return false;
  if (!env[opts.r2Binding]) return false;
  return pathAllowed(env[opts.recordPathsBinding], pathname);
}

export async function recordVisit(r2, { response, request, who, path, status, now = new Date(), markers = [] }) {
  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  const hash = (await sha256Hex(buffer)).slice(0, 32);

  const slice = size > MAX_FEATURE_BYTES ? buffer.slice(0, MAX_FEATURE_BYTES) : buffer;
  const html = new TextDecoder().decode(slice);
  const features = extractFeatures(html, { totalBytes: size, markers });

  let snapshot = 'skipped-too-large';
  if (size <= MAX_SNAPSHOT_BYTES) {
    const key = `snapshots/${hash}.html`;
    if (await r2.head(key)) {
      snapshot = 'existing';
    } else {
      await r2.put(key, buffer, {
        httpMetadata: { contentType: 'text/html; charset=utf-8' },
        customMetadata: { firstSeen: now.toISOString() },
      });
      snapshot = 'new';
    }
  }

  const iso = now.toISOString();
  const rand = crypto.getRandomValues(new Uint8Array(3)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
  const key = `visits/${iso.slice(0, 10)}/${safe(who.name)}/${iso.slice(11, 19).replace(/:/g, '')}-${rand}.json`;
  const record = {
    time: iso,
    bot: who.name,
    kind: who.kind,
    verified: who.verified,
    path,
    status,
    bytes: size,
    hash,
    snapshot,
    request: headerFingerprint(request),
    features,
  };
  await r2.put(key, JSON.stringify(record), {
    httpMetadata: { contentType: 'application/json' },
    customMetadata: {
      bot: record.bot,
      path: path.slice(0, 120),
      hash,
      words: String(features.words),
      title: features.title.slice(0, 80),
    },
  });
  return { key, hash, snapshot };
}

// Lists recent visit records (summary only, from object metadata: one R2 call).
export async function listVisits(r2, { day, bot, limit = 100 }) {
  const prefix = bot ? `visits/${day}/${safe(bot)}/` : `visits/${day}/`;
  const listed = await r2.list({ prefix, limit: Math.min(limit, 200), include: ['customMetadata'] });
  return listed.objects.map((o) => ({ key: o.key, ...(o.customMetadata || {}) }));
}

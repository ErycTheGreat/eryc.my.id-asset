// Records one aggregated counter per bot per UTC day in a KV namespace.
//
// Privacy: only bot traffic is recorded, and only the bot name, path (no query
// string), status and a count. No IP addresses and nothing about human visitors.
//
// LIMIT: KV has no atomic increment, so concurrent hits can lose a count. The
// numbers are approximate. That is fine for trends; move to Analytics Engine
// if exact counts matter.

const MAX_PATHS_PER_BOT_DAY = 50;
const MAX_PATH_LENGTH = 200;
const TTL_SECONDS = 60 * 60 * 24 * 60; // keep 60 days, enough for week-over-week

// Workers KV on the free plan allows 1,000 writes per day for the whole account.
// Each bot gets at most this many counter writes per UTC day; after that its
// entry is marked `capped` and further hits are not counted. Worst case is
// (distinct bots x cap), so keep the cap low on the free plan.
export const DEFAULT_DAILY_CAP = 40;

export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);
export const hitKey = (day, bot) => `hit:${day}:${bot}`;

export function normalizePath(pathname) {
  const path = typeof pathname === 'string' && pathname ? pathname : '/';
  return path.length > MAX_PATH_LENGTH ? path.slice(0, MAX_PATH_LENGTH) : path;
}

// Returns { written, count, capped } so callers can decide whether to do more work.
export async function recordHit(kv, { bot, kind, path, status, now = new Date(), cap = DEFAULT_DAILY_CAP }) {
  if (!kv) return { written: false, count: 0, capped: false };
  const key = hitKey(dayKey(now), bot);
  let entry;
  try {
    entry = JSON.parse((await kv.get(key)) || 'null');
  } catch {
    entry = null;
  }
  entry = entry || { bot, kind, count: 0, status: {}, paths: {} };

  if (entry.capped) return { written: false, count: entry.count, capped: true };

  entry.count += 1;
  const code = String(status);
  entry.status[code] = (entry.status[code] || 0) + 1;

  const p = normalizePath(path);
  if (p in entry.paths || Object.keys(entry.paths).length < MAX_PATHS_PER_BOT_DAY) {
    entry.paths[p] = (entry.paths[p] || 0) + 1;
  }

  if (entry.count >= cap) entry.capped = true;

  await kv.put(key, JSON.stringify(entry), { expirationTtl: TTL_SECONDS });
  return { written: true, count: entry.count, capped: Boolean(entry.capped) };
}

// ---- AI referrals -------------------------------------------------------
// A human who clicks a link inside an AI answer arrives with a Referer from the
// AI product, or a utm_source it appends. This is the first outcome signal:
// it shows an AI answer actually sent someone to the page.
const AI_REFERRERS = [
  { name: 'chatgpt', re: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/i, utm: /chatgpt/i },
  { name: 'perplexity', re: /(^|\.)perplexity\.ai$/i, utm: /perplexity/i },
  { name: 'claude', re: /(^|\.)claude\.ai$/i, utm: /claude/i },
  { name: 'gemini', re: /(^|\.)gemini\.google\.com$/i, utm: /gemini/i },
  { name: 'copilot', re: /(^|\.)copilot\.microsoft\.com$/i, utm: /copilot/i },
  { name: 'you.com', re: /(^|\.)you\.com$/i, utm: /^you/i },
  { name: 'phind', re: /(^|\.)phind\.com$/i, utm: /phind/i },
];

// Only the matched product name leaves this function. The full Referer URL is
// never stored because it can carry a person's query.
export function aiReferralSource(referer, utmSource) {
  let host = '';
  try {
    host = referer ? new URL(referer).hostname : '';
  } catch {
    host = '';
  }
  for (const r of AI_REFERRERS) {
    if ((host && r.re.test(host)) || (utmSource && r.utm.test(utmSource))) return r.name;
  }
  return null;
}

export const DEFAULT_REFERRAL_CAP = 25;

export async function recordReferral(kv, { source, path, now = new Date(), cap = DEFAULT_REFERRAL_CAP }) {
  if (!kv) return { written: false };
  const key = `ref:${dayKey(now)}:${source}`;
  let entry;
  try {
    entry = JSON.parse((await kv.get(key)) || 'null');
  } catch {
    entry = null;
  }
  entry = entry || { source, count: 0, paths: {} };
  if (entry.capped) return { written: false };
  entry.count += 1;
  const p = normalizePath(path);
  if (p in entry.paths || Object.keys(entry.paths).length < 30) entry.paths[p] = (entry.paths[p] || 0) + 1;
  if (entry.count >= cap) entry.capped = true;
  await kv.put(key, JSON.stringify(entry), { expirationTtl: TTL_SECONDS });
  return { written: true };
}

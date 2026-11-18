// Cloudflare Worker entry. Wraps any origin worker with bot telemetry.
//
// Default bindings (names can be changed with the options argument):
//   AGP_KV             KV namespace for counters (required for logging)
//   AGP_DIGEST_TOKEN   secret; if unset the /__agp/* endpoints are disabled (404)
//   AGP_R2             optional R2 bucket for the flight recorder (Phase 1)
//   AGP_RECORD_PATHS   variable: "*" or comma separated path prefixes to record.
//                      Empty/unset = recorder off. Change it in the dashboard, no deploy.
//   AGP_RECORD         variable: set to "off" to stop the recorder instantly.
//
// This layer observes only. It never changes the response a visitor or bot gets,
// and it keeps every other handler of the wrapped worker (scheduled, queue, ...).
import { classify, isBot } from './classify.js';
import { recordHit, recordReferral, aiReferralSource, normalizePath } from './telemetry.js';
import { buildDigest, renderMarkdown } from './digest.js';
import { recorderEnabled, recordVisit, listVisits } from './recorder.js';

const DEFAULTS = {
  kvBinding: 'AGP_KV',
  tokenBinding: 'AGP_DIGEST_TOKEN',
  r2Binding: 'AGP_R2',
  recordPathsBinding: 'AGP_RECORD_PATHS',
  markers: [],
};

// Compare without exiting early on the first mismatch.
function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] || 0) ^ (y[i] || 0);
  }
  return diff === 0;
}

// Returns a Response if the caller is not allowed, otherwise null.
function authorize(request, env, tokenBinding) {
  const token = env[tokenBinding];
  if (!token) return new Response('Not found', { status: 404 });
  const auth = request.headers.get('Authorization') || '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!safeEqual(given, token)) return new Response('Unauthorized', { status: 401 });
  return null;
}

export async function handleDigest(request, env, options = {}) {
  const { kvBinding, tokenBinding } = { ...DEFAULTS, ...options };
  const denied = authorize(request, env, tokenBinding);
  if (denied) return denied;
  const url = new URL(request.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10) || 7, 1), 30);
  const digest = await buildDigest(env[kvBinding], { days });
  if (url.searchParams.get('format') === 'json') {
    return Response.json(digest);
  }
  return new Response(renderMarkdown(digest), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

// GET /__agp/visits?day=YYYY-MM-DD&bot=GPTBot   -> summaries of recorded visits
// GET /__agp/visit?key=visits/...               -> one full visit record
// GET /__agp/snapshot/<hash>                    -> the exact page that was served
export async function handleRecorder(request, env, options = {}) {
  const { r2Binding, tokenBinding } = { ...DEFAULTS, ...options };
  const denied = authorize(request, env, tokenBinding);
  if (denied) return denied;
  const r2 = env[r2Binding];
  if (!r2) return new Response('Recorder bucket not bound', { status: 404 });
  const url = new URL(request.url);
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

  if (url.pathname === '/__agp/visits') {
    const day = url.searchParams.get('day') || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return new Response('Bad day', { status: 400 });
    const bot = url.searchParams.get('bot') || undefined;
    return Response.json({ day, visits: await listVisits(r2, { day, bot }) }, { headers });
  }
  if (url.pathname === '/__agp/visit') {
    const key = url.searchParams.get('key') || '';
    if (!/^visits\/\d{4}-\d{2}-\d{2}\/[A-Za-z0-9_-]+\/[0-9a-f-]+\.json$/.test(key)) return new Response('Bad key', { status: 400 });
    const obj = await r2.get(key);
    if (!obj) return new Response('Not found', { status: 404 });
    return new Response(obj.body, { headers: { ...headers, 'Content-Type': 'application/json' } });
  }
  const m = url.pathname.match(/^\/__agp\/snapshot\/([0-9a-f]{32})$/);
  if (m) {
    const obj = await r2.get(`snapshots/${m[1]}.html`);
    if (!obj) return new Response('Not found', { status: 404 });
    // Captured pages are untrusted. Show them as plain text, never as live HTML on your domain.
    return new Response(obj.body, {
      headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8', 'Content-Security-Policy': 'sandbox' },
    });
  }
  return new Response('Not found', { status: 404 });
}

export function withAgp(worker, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  return {
    ...worker, // keep scheduled, queue, etc. untouched
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      if (url.pathname === '/__agp/digest') return handleDigest(request, env, opts);
      if (url.pathname === '/__agp/visits' || url.pathname === '/__agp/visit' || url.pathname.startsWith('/__agp/snapshot/')) {
        return handleRecorder(request, env, opts);
      }

      const response = await worker.fetch(request, env, ctx);

      const kv = env[opts.kvBinding];
      if (!kv) return response;
      const who = classify(request.headers.get('User-Agent'));
      const isHtml = (response.headers.get('Content-Type') || '').includes('text/html');
      const path = normalizePath(url.pathname);

      if (isBot(who)) {
        // Only clone when the recorder is on for this path and the body is a plain 200 page.
        const wantBody =
          request.method === 'GET' && response.status === 200 && isHtml && recorderEnabled(env, opts, url.pathname);
        const copy = wantBody ? response.clone() : null;
        ctx.waitUntil(
          (async () => {
            const hit = await recordHit(kv, { bot: who.name, kind: who.kind, path, status: response.status });
            if (copy && hit.written) {
              await recordVisit(env[opts.r2Binding], {
                response: copy,
                request,
                who,
                path,
                status: response.status,
                markers: opts.markers,
              });
            } else if (copy) {
              await copy.body?.cancel();
            }
          })().catch((e) => console.error('agp: telemetry failed', e))
        );
      } else if (request.method === 'GET' && isHtml && env.AGP_RECORD !== 'off') {
        const source = aiReferralSource(request.headers.get('Referer'), url.searchParams.get('utm_source'));
        if (source) {
          ctx.waitUntil(recordReferral(kv, { source, path }).catch((e) => console.error('agp: referral failed', e)));
        }
      }
      return response;
    },
  };
}

// Default: pass every request straight to the origin.
export default withAgp({ fetch: (request) => fetch(request) });

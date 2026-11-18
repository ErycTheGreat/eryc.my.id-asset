// Cloudflare Worker entry. Wraps any origin worker with bot telemetry.
//
// Default bindings (names can be changed with the options argument):
//   AGP_KV            KV namespace for counters (required for logging)
//   AGP_DIGEST_TOKEN  secret; if unset the digest endpoint is disabled (404)
//
// This layer observes only. It never changes the response a visitor or bot gets,
// and it keeps every other handler of the wrapped worker (scheduled, queue, ...).
import { classify, isBot } from './classify.js';
import { recordHit, normalizePath } from './telemetry.js';
import { buildDigest, renderMarkdown } from './digest.js';

const DEFAULTS = { kvBinding: 'AGP_KV', tokenBinding: 'AGP_DIGEST_TOKEN' };

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

export async function handleDigest(request, env, options = {}) {
  const { kvBinding, tokenBinding } = { ...DEFAULTS, ...options };
  const token = env[tokenBinding];
  if (!token) return new Response('Not found', { status: 404 });
  const auth = request.headers.get('Authorization') || '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!safeEqual(given, token)) {
    return new Response('Unauthorized', { status: 401 });
  }
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

export function withAgp(worker, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  return {
    ...worker, // keep scheduled, queue, etc. untouched
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      if (url.pathname === '/__agp/digest') return handleDigest(request, env, opts);

      const response = await worker.fetch(request, env, ctx);

      const kv = env[opts.kvBinding];
      const who = classify(request.headers.get('User-Agent'));
      if (isBot(who) && kv) {
        ctx.waitUntil(
          recordHit(kv, {
            bot: who.name,
            kind: who.kind,
            path: normalizePath(url.pathname),
            status: response.status,
          }).catch((e) => console.error('agp: telemetry failed', e))
        );
      }
      return response;
    },
  };
}

// Default: pass every request straight to the origin.
export default withAgp({ fetch: (request) => fetch(request) });

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

export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);
export const hitKey = (day, bot) => `hit:${day}:${bot}`;

export function normalizePath(pathname) {
  const path = typeof pathname === 'string' && pathname ? pathname : '/';
  return path.length > MAX_PATH_LENGTH ? path.slice(0, MAX_PATH_LENGTH) : path;
}

export async function recordHit(kv, { bot, kind, path, status, now = new Date() }) {
  if (!kv) return;
  const key = hitKey(dayKey(now), bot);
  let entry;
  try {
    entry = JSON.parse((await kv.get(key)) || 'null');
  } catch {
    entry = null;
  }
  entry = entry || { bot, kind, count: 0, status: {}, paths: {} };

  entry.count += 1;
  const code = String(status);
  entry.status[code] = (entry.status[code] || 0) + 1;

  const p = normalizePath(path);
  if (p in entry.paths || Object.keys(entry.paths).length < MAX_PATHS_PER_BOT_DAY) {
    entry.paths[p] = (entry.paths[p] || 0) + 1;
  }

  await kv.put(key, JSON.stringify(entry), { expirationTtl: TTL_SECONDS });
}

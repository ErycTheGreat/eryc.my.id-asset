// Builds a weekly digest from the daily counters written by telemetry.js.
import { dayKey } from './telemetry.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// The `days` UTC days ending `offsetDays` before today (offset 0 = ending today).
export function dayList(now, days, offsetDays = 0) {
  const list = [];
  for (let i = 0; i < days; i++) {
    list.push(dayKey(new Date(now.getTime() - (offsetDays + i) * DAY_MS)));
  }
  return list.reverse();
}

async function loadDay(kv, day) {
  const entries = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: `hit:${day}:`, cursor });
    for (const { name } of page.keys) {
      try {
        const value = JSON.parse((await kv.get(name)) || 'null');
        if (value) entries.push(value);
      } catch {
        // skip a corrupt entry rather than fail the whole digest
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return entries;
}

async function loadRefDay(kv, day) {
  const entries = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: `ref:${day}:`, cursor });
    for (const { name } of page.keys) {
      try {
        const value = JSON.parse((await kv.get(name)) || 'null');
        if (value) entries.push(value);
      } catch {
        // skip a corrupt entry
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return entries;
}

async function loadPeriod(kv, days) {
  const all = [];
  for (const day of days) all.push(...(await loadDay(kv, day)));
  return all;
}

const sumErrors = (entry) =>
  Object.entries(entry.status).reduce((n, [code, c]) => (Number(code) >= 400 ? n + c : n), 0);

function byBot(entries) {
  const map = new Map();
  for (const e of entries) {
    const row = map.get(e.bot) || { bot: e.bot, kind: e.kind, count: 0, errors: 0, cappedDays: 0 };
    row.count += e.count;
    if (e.capped) row.cappedDays += 1;
    row.errors += sumErrors(e);
    map.set(e.bot, row);
  }
  return map;
}

export async function buildDigest(kv, { days = 7, now = new Date() } = {}) {
  const currentDays = dayList(now, days, 0);
  const previousDays = dayList(now, days, days);
  const current = await loadPeriod(kv, currentDays);
  const previous = await loadPeriod(kv, previousDays);

  const refMap = new Map();
  for (const day of currentDays) {
    for (const r of await loadRefDay(kv, day)) {
      const row = refMap.get(r.source) || { source: r.source, count: 0, cappedDays: 0, paths: {} };
      row.count += r.count;
      if (r.capped) row.cappedDays += 1;
      for (const [path, c] of Object.entries(r.paths || {})) row.paths[path] = (row.paths[path] || 0) + c;
      refMap.set(r.source, row);
    }
  }
  const referrals = [...refMap.values()]
    .map((r) => ({
      source: r.source,
      count: r.count,
      cappedDays: r.cappedDays,
      topPath: Object.entries(r.paths).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    }))
    .sort((a, b) => b.count - a.count);

  const currentByBot = byBot(current);
  const previousByBot = byBot(previous);

  const bots = [...currentByBot.values()]
    .map((row) => {
      const prev = previousByBot.get(row.bot)?.count || 0;
      const change = prev === 0 ? null : Math.round(((row.count - prev) / prev) * 100);
      return { ...row, prev, change };
    })
    .sort((a, b) => b.count - a.count);

  // Bots that visited last period but not this one: the earliest decay signal.
  const gone = [...previousByBot.values()]
    .filter((row) => !currentByBot.has(row.bot))
    .map((row) => ({ bot: row.bot, kind: row.kind, prev: row.count }));

  const pathCounts = new Map();
  for (const e of current) {
    for (const [path, c] of Object.entries(e.paths)) {
      pathCounts.set(path, (pathCounts.get(path) || 0) + c);
    }
  }
  const topPaths = [...pathCounts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const hits = bots.reduce((n, b) => n + b.count, 0);
  const errors = bots.reduce((n, b) => n + b.errors, 0);
  const aiHits = bots.filter((b) => b.kind === 'ai').reduce((n, b) => n + b.count, 0);

  return {
    period: { from: currentDays[0], to: currentDays.at(-1), days },
    totals: { hits, aiHits, errors, errorRate: hits === 0 ? 0 : Math.round((errors / hits) * 1000) / 10 },
    bots,
    gone,
    topPaths,
    referrals,
  };
}

const arrow = (change) => (change === null ? 'new' : `${change > 0 ? '+' : ''}${change}%`);

export function renderMarkdown(d) {
  const lines = [];
  lines.push(`# Bot digest, ${d.period.from} to ${d.period.to}`);
  lines.push('');
  lines.push(
    `${d.totals.hits} bot hits, ${d.totals.aiHits} from AI bots, ${d.totals.errors} errors (${d.totals.errorRate}%). Counts are approximate.`
  );
  lines.push('');
  if (d.bots.length === 0) {
    lines.push('No bot traffic recorded in this period.');
  } else {
    lines.push('| Bot | Kind | Hits | vs previous period | Errors |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const b of d.bots) {
      const flag = b.cappedDays > 0 ? ` (hit daily cap on ${b.cappedDays} day${b.cappedDays > 1 ? 's' : ''}, real count is higher)` : '';
      lines.push(`| ${b.bot} | ${b.kind} | ${b.count}${flag} | ${arrow(b.change)} | ${b.errors} |`);
    }
  }
  if (d.gone.length > 0) {
    lines.push('');
    lines.push('## No longer visiting');
    lines.push('');
    for (const g of d.gone) lines.push(`- ${g.bot} (${g.kind}) made ${g.prev} hits the period before and none this period.`);
  }
  if (d.referrals && d.referrals.length > 0) {
    lines.push('');
    lines.push('## Visits that came from AI answers');
    lines.push('');
    for (const r of d.referrals) {
      const cap = r.cappedDays > 0 ? ' (daily cap reached on some days)' : '';
      lines.push(`- ${r.source}: ${r.count}${cap}${r.topPath ? `, most often to ${r.topPath}` : ''}`);
    }
  }
  if (d.topPaths.length > 0) {
    lines.push('');
    lines.push('## Most fetched paths');
    lines.push('');
    for (const p of d.topPaths) lines.push(`- ${p.path}: ${p.count}`);
  }
  lines.push('');
  return lines.join('\n');
}

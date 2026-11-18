// Turns a served HTML page into a small, comparable fingerprint.
// Pure functions, no I/O. Kept deliberately cheap: Workers on the free plan get
// about 10 ms of CPU per request, so input is capped and nothing here loops
// over the document more than a few times.

export const MAX_FEATURE_BYTES = 150 * 1024; // analyse at most the first 150 KB

const STOPWORDS = new Set(
  (
    'about above after again also been before being between both cannot could does doing down during each ' +
    'from further have having here into just more most other over same should some such than that their ' +
    'them then there these they this those through under until very were what when where which while will ' +
    'with would your yang dan dengan untuk dari pada atau dalam adalah akan juga oleh ini itu saya kami ' +
    'kita anda sebagai karena agar bisa dapat tidak lebih sudah masih'
  ).split(' ')
);

export async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

const clean = (s, max = 200) => decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, max);

function metaContent(html, attr, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const re = new RegExp(`${attr}\\s*=\\s*["']${value}["']`, 'i');
    if (re.test(tag)) {
      const m = tag.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
      if (m) return clean(m[1] ?? m[2], 300);
    }
  }
  return '';
}

function jsonLdTypes(html) {
  const types = [];
  let blocks = 0;
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) && blocks < 5) {
    blocks += 1;
    if (m[1].length > 20000) continue;
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : data['@graph'] || [data];
      for (const item of items) {
        const t = item && item['@type'];
        if (t) types.push(...[].concat(t).map(String));
      }
    } catch {
      types.push('INVALID_JSON');
    }
  }
  return { blocks, types: [...new Set(types)].slice(0, 10) };
}

function topTerms(text, limit = 10) {
  const counts = new Map();
  const words = text.toLowerCase().match(/[a-zA-ZÀ-ɏ]{4,}/g) || [];
  for (const w of words.slice(0, 3000)) {
    if (STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

// `html` is the (possibly truncated) page text. `totalBytes` is the full size served.
export function extractFeatures(html, { totalBytes = html.length, markers = [] } = {}) {
  const truncated = totalBytes > MAX_FEATURE_BYTES;
  const title = clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const canonicalTag = (html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i) || [])[0] || '';
  const canonical = (canonicalTag.match(/href\s*=\s*["']([^"']*)["']/i) || [])[1] || '';

  const h1 = [];
  const h1re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let m;
  while ((m = h1re.exec(html)) && h1.length < 3) h1.push(clean(m[1], 120));

  const visible = html
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const text = clean(visible, MAX_FEATURE_BYTES);
  const words = text ? text.split(' ').length : 0;

  const present = {};
  for (const marker of markers) present[marker] = html.includes(marker);

  return {
    title,
    description: metaContent(html, 'name', 'description'),
    canonical,
    h1,
    h2Count: (html.match(/<h2\b/gi) || []).length,
    h3Count: (html.match(/<h3\b/gi) || []).length,
    linkCount: (html.match(/<a\b/gi) || []).length,
    jsonLd: jsonLdTypes(html),
    words,
    textShare: totalBytes > 0 ? Math.round((text.length / Math.min(totalBytes, MAX_FEATURE_BYTES)) * 100) / 100 : 0,
    topTerms: topTerms(text),
    markers: present,
    truncated,
  };
}

const short = (value, max = 160) => (value ? String(value).slice(0, max) : '');

// What the bot said about itself and how it asked. No IP address, no cookies.
export function headerFingerprint(request) {
  const h = request.headers;
  const cf = request.cf || {};
  return {
    accept: short(h.get('Accept')),
    acceptEncoding: short(h.get('Accept-Encoding'), 80),
    acceptLanguage: short(h.get('Accept-Language'), 80),
    range: Boolean(h.get('Range')),
    conditional: Boolean(h.get('If-None-Match') || h.get('If-Modified-Since')),
    ua: short(h.get('User-Agent'), 200),
    asn: cf.asn ?? null,
    asOrganization: short(cf.asOrganization, 80) || null,
    verifiedBotCategory: short(cf.verifiedBotCategory, 60) || null,
  };
}

// Blog entries come from the EmDash blog worker (service binding BLOG_WORKER) so new posts appear
// automatically. Any failure returns [] and the static sitemap is served exactly as before.
async function getBlogEntries(env) {
  if (!env || !env.BLOG_WORKER) return [];
  const get = async (u) => {
    const r = await env.BLOG_WORKER.fetch(new Request(u, { headers: { "User-Agent": "sitemap-merge" } }));
    return r.ok ? await r.text() : "";
  };
  const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
  try {
    const root = await get("https://www.eryc.my.id/blog/sitemap.xml");
    const xmls = /<sitemapindex/i.test(root)
      ? await Promise.all(locs(root).filter((u) => u.startsWith("https://www.eryc.my.id/blog/")).slice(0, 10).map(get))
      : [root];
    const out = [];
    for (const xml of xmls) {
      for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const loc = (m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1];
        const lm = (m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/) || [])[1];
        if (loc && loc.startsWith("https://www.eryc.my.id/blog/")) out.push({ loc: loc.replace(/&amp;/g, "&"), lastmod: lm });
      }
    }
    // the blog hub is only listed once there is at least one post (the empty hub is noindex)
    if (out.length && !out.some((e) => e.loc === "https://www.eryc.my.id/blog/")) {
      out.unshift({ loc: "https://www.eryc.my.id/blog/", lastmod: out[0].lastmod });
    }
    return out;
  } catch (_) {
    return [];
  }
}

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export async function handleSitemapRequest(url, env) {
  const canonicalHost = "www.eryc.my.id";
  const pages = [
    "/", 
    "/about", 
    "/glossary", 
    "/case-studies/seo", 
    "/case-studies/seo/soundbrothers", 
    "/case-studies/edge-seo"
  ];
  
  // Menghasilkan timestamp otomatis (contoh: 2026-09-14T00:00:00.000Z)
  const lastmod = new Date().toISOString();

  // --- 1. XML SITEMAP (BRUTE-FORCE DENGAN CONTENT-LENGTH) ---
  if (url.pathname === "/sitemap.xml" || url.pathname === "/sitemap.xml/") {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
    
    pages.forEach(path => {
      const priority = path === "/" ? "1.0" : "0.7";
      sitemap += `<url><loc>https://${canonicalHost}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
    });
    
    const blog = await getBlogEntries(env);
    blog.forEach((e) => {
      sitemap += `<url><loc>${esc(e.loc)}</loc><lastmod>${e.lastmod || lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });

    sitemap += '</urlset>';

    // Kalkulasi byte pasti untuk mencegah chunked encoding yang dibenci GSC
    const sitemapBytes = new TextEncoder().encode(sitemap).length;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=86400",
        "Content-Length": sitemapBytes.toString(),
        "Connection": "close"
      }
    });
  }

  // --- 2. PLAIN TEXT SITEMAP (FALLBACK) ---
  if (url.pathname === "/sitemap.txt" || url.pathname === "/sitemap.txt/") {
    const blogTxt = (await getBlogEntries(env)).map((e) => e.loc);
    const urls = pages.map(path => `https://${canonicalHost}${path}`).concat(blogTxt).join("\n");
    
    // Kalkulasi byte pasti
    const txtBytes = new TextEncoder().encode(urls).length;

    return new Response(urls, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
        "Cache-Control": "public, max-age=86400",
        "Content-Length": txtBytes.toString(),
        "Connection": "close"
      }
    });
  }

  return null;
}

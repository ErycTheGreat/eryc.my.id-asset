export function handleSitemapRequest(url) {
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
    const urls = pages.map(path => `https://${canonicalHost}${path}`).join("\n");
    
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

function handleSitemap(canonicalHost) {
  // Automatically grab today's date (e.g., "2026-04-03"). 
  // This tells Googlebot the site was updated today, encouraging 
  // faster and more frequent crawling.
  const lastmod = new Date().toISOString().split('T')[0];
  
  // Define your site structure here. If you add a new page to 
  // your Google Site, you MUST add the path to this array so 
  // the edge router knows to tell Google about it.
  const pages = [
    "/", 
    "/about", 
    "/services", 
    "/portfolio", 
    "/blog", 
    "/contact"
  ];
  
  // Construct the raw XML string expected by Search Engines
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pages.forEach(path => {
    sitemap += `  <url>\n    <loc>https://${canonicalHost}${path}</loc>\n`;
    sitemap += `    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n`;
    
    // Give the homepage maximum priority (1.0), and subpages normal priority (0.7)
    sitemap += `    <priority>${path === "/" ? "1.0" : "0.7"}</priority>\n  </url>\n`;
  });
  sitemap += '</urlset>';

  // Serve the string as an official XML file. We tell Cloudflare to 
  // cache this for 24 hours (86400 seconds) to save compute operations.
  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const path = url.pathname;
    const canonicalHost = "www.eryc.my.id";

    // ✅ FIX 1: DEFINE missing variables (CRITICAL)
    const canonicalUrl = `https://${canonicalHost}${path}`;
    const domain = `https://${canonicalHost}`;

    // 1. FORCE NAKED TO WWW & KILL "/home"
    if (host !== canonicalHost) {
      return Response.redirect(`https://${canonicalHost}${path}${url.search}`, 301);
    }
    if (path === "/home" || path === "/home/") {
      return Response.redirect(`https://${canonicalHost}/`, 301);
    }

    // 2. SITEMAP
    if (path === "/sitemap.xml") {
      const lastmod = new Date().toISOString().split('T')[0];
      const pages = ["/", "/about", "/glossary", "/case-studies/seo", "/case-studies/seo/mortgage-broker", "/case-studies/seo/sound-rentals", "/case-studies/seo/vet-clinic"];
      
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      pages.forEach(p => {
        sitemap += `  <url>\n    <loc>https://${canonicalHost}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n  </url>\n`;
      });
      sitemap += '</urlset>';
      return new Response(sitemap, {
        headers: {
          "Content-Type": "application/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    // 3. ROBOTS.TXT
    if (path === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\n\nSitemap: https://${canonicalHost}/sitemap.xml`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    // =================================================================
    // 3.5 DROPBOX PROXY
    // =================================================================
    if (url.pathname.startsWith("/dropbox/")) {
      const dropboxPath = url.pathname.replace("/dropbox", "");
      const targetUrl = `https://dl.dropboxusercontent.com${dropboxPath}${url.search}`;

      let response = await fetch(targetUrl, {
        cf: {
          cacheTtl: 31536000,
          cacheEverything: true,
        },
        headers: request.headers,
      });

      const newHeaders = new Headers(response.headers);
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      newHeaders.set("X-Proxy-Origin", "Dropbox-via-Cloudflare");
      newHeaders.delete("Link");
      newHeaders.delete("X-Robots-Tag");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // =================================================================
    // FETCH FROM ORIGIN
    // =================================================================
    async function fetchFromOrigin(path, url, env) {
      const targetUrl = `${env.ORIGIN_URL}${path}${url.search}`;

      const modifiedRequest = new Request(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "text/html,application/xhtml+xml",
          "User-Agent": "Mozilla/5.0",
        },
        redirect: "follow"
      });

      return await fetch(modifiedRequest);
    }

    if (path !== "/" && !path.startsWith("/dropbox/")) {
      return await fetchFromOrigin(path, url, env);
    }

    const response = await fetchFromOrigin(path, url, env);

    // =================================================================
    // ⚠️ FIX 2: ONLY REWRITE HTML (PREVENT 1101)
    // =================================================================
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    // HEADER INJECTION
    const customHeaderContent = `
        <meta name="description" content="I'm Eryc, a data-driven SEO & Digital Marketing Specialist in Malang. I help fix business systems or get your business noticed by Google.">
        <meta name="keywords" content="eryc tri juni s, digital marketing specialist, portfolio, SEO specialist, malang">
        <meta name="author" content="Eryc Tri Juni S">
      
        <meta name="google-site-verification" content="Qval4eNJhMpInxPCHk-08v6D9sxftApTQc1E8Z6hbug"> 
        <link rel="canonical" href="${canonicalUrl}">
        <link rel="author" href="${domain}/about">
            
        <meta property="og:type" content="website">
        <meta property="og:title" content="Eryc Tri Juni S | SEO & Digital Marketing Specialist">
        <meta property="og:description" content="Need to fix your business systems or get noticed? I deliver low-cost, data-driven SEO and digital marketing solutions for measurable growth. No B.S.">
        <meta property="og:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
        <meta property="og:url" content="${canonicalUrl}">
    `;

    const accessibleTextContent = `
      <div style="clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px;">
        <header><h1>Digital Marketing Specialist in Malang</h1></header>
        <main><h2>P.S. THIS SITE: 100% [GOOGLE SITES]</h2><p>"I Help Business Fix or Get Noticed @ low-cost"</p></main>
      </div>
    `;

    let rewriter = new HTMLRewriter()
      .on("head", { element(el) { el.append(customHeaderContent, { html: true }); } })
      .on("body", { element(el) { el.append(accessibleTextContent, { html: true }); } });

    let finalHeaders = new Headers(response.headers);
    finalHeaders.delete("Content-Length");

    return new Response(rewriter.transform(response).body, {
      status: response.status,
      headers: finalHeaders
    });

    // ❌ FIX 3: removed duplicate return (no change in behavior)
  }
};

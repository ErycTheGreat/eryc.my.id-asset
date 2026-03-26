export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const canonicalHost = "www.eryc.my.id";

    // 1. FORCE NAKED TO WWW & KILL "/home"
    if (host !== canonicalHost) {
      return Response.redirect(`https://${canonicalHost}${url.pathname}`, 301);
    }
    if (url.pathname === "/home" || url.pathname === "/home/") {
      return Response.redirect(`https://${canonicalHost}/`, 301);
    }

    // 2. SITEMAP
    if (url.pathname === "/sitemap.xml") {
      const lastmod = new Date().toISOString().split('T')[0];
      const pages = ["/", "/about", "/glossary", "/case-studies/seo", "/case-studies/seo/mortgage-broker", "/case-studies/seo/sound-rentals", "/case-studies/seo/vet-clinic"];
      
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      pages.forEach(path => {
        sitemap += `  <url>\n    <loc>https://${canonicalHost}${path}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>${path === "/" ? "1.0" : "0.7"}</priority>\n  </url>\n`;
      });
      sitemap += '</urlset>';

      return new Response(sitemap, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    // 3. ROBOTS.TXT
    if (url.pathname === "/robots.txt") {
      const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: https://${canonicalHost}/sitemap.xml`;
      return new Response(robotsTxt, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }
	
	// 3.5 THE DROPBOX CDN PROXY
	const path = url.pathname;
    if (path.startsWith("/dropbox/")) {
      const dropboxPath = path.replace("/dropbox", "");
      const targetUrl = `https://dl.dropboxusercontent.com${dropboxPath}${url.search}`;
      let dropboxRes = await fetch(targetUrl, {
        cf: { cacheTtl: 31536000, cacheEverything: true },
        headers: request.headers,
      });
      const newHeaders = new Headers(dropboxRes.headers);
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      newHeaders.set("X-Proxy-Origin", "Dropbox-via-Cloudflare");
      return new Response(dropboxRes.body, { status: dropboxRes.status, headers: newHeaders });
    }

    // 4. THE BLAZING FAST BYPASS
    if (url.pathname !== "/") {
      return fetch(request);
    }

    // 5. HOMEPAGE ONLY: Stream the SEO payload using native compression
    const targetUrl = env.ORIGIN_URL + url.pathname + url.search;

const response = await fetch(targetUrl, {
  headers: request.headers,
  redirect: "manual",
  cf: {
    cacheTtl: 300,
    cacheEverything: true
  }
});

	if (response.status === 301 || response.status === 302) {
  const newHeaders = new Headers(response.headers);
  newHeaders.delete("Location"); // 🔥 THIS IS THE KEY

  return new Response(response.body, {
    status: 200,
    headers: newHeaders
  });
}
    
	  const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
        return response;
    }

    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname;

    // The entire <head> payload (Meta + JSON-LD)
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
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Eryc Tri Juni S | SEO & Digital Marketing Specialist">
        <meta name="twitter:description" content="Need to fix your business systems or get noticed? I deliver low-cost, data-driven SEO and digital marketing solutions for measurable growth. No B.S.">
        <meta name="twitter:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
        
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://www.eryc.my.id/#website",
              "url": "https://www.eryc.my.id",
              "name": "Eryc Tri Juni S | SEO & Digital Marketing Specialist Malang",
              "description": "The official portfolio website of Eryc Tri Juni S, offering SEO services, full-stack digital marketing services, and small business advisory in Malang and worldwide.",
              "alternateName": "eryc",
              "publisher": {
                "@id": "https://www.eryc.my.id/#website"
              },
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.eryc.my.id/?s={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "WebPage",
              "@id": "https://www.eryc.my.id/#webpage",
              "url": "https://www.eryc.my.id/",
              "name": "Eryc Tri Juni S | SEO & Digital Marketing Specialist Malang",
			  "description": "Eryc Tri Juni S is an SEO & digital marketing specialist in Malang, and a small business advisor. He helps fix business systems or get noticed at low cost.",
              "about": {
                "@id": "https://www.eryc.my.id/#website"
              },
              "isPartOf": {
                "@id": "https://www.eryc.my.id/#website"
              },
              "primaryImageOfPage": {
                "@id": "https://www.dropbox.com/scl/fi/e6x2i45cirhotrnrvkwg9/eryctrijunis-eryc.my.id-home-screen-shot.jpeg?rlkey=mbqfgb4tnic50tcoiyo3tk7n4&st=6vc1q9ze&raw=1"
              },
              "inLanguage": "en-US"
            },
            {
              "@type": "ImageObject",
              "@id": "https://www.dropbox.com/scl/fi/ivr9t7qu6r4vjt0hd5076/android-chrome-512x512.png?rlkey=n2erjbo7u707khljztqtyac59&raw=1",
              "url": "https://www.dropbox.com/scl/fi/ivr9t7qu6r4vjt0hd5076/android-chrome-512x512.png?rlkey=n2erjbo7u707khljztqtyac59&raw=1",
              "width": 512,
              "height": 512,
              "caption": "Eryc Tri Juni S | SEO & Digital Marketing Specialist",
              "inLanguage": "en-US"
            },
            {
              "@type": "Person",
              "@id": "https://www.eryc.my.id/#person",
              "name": "Eryc Tri Juni S",
              "description": "Eryc Tri Juni S is an SEO & digital marketing specialist in Malang with 8 years of product innovation experience. He is fluent in data-driven strategies and critical analysis.",
              "email": "eryc.me@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Malang Regency",
                "addressRegion": "East Java",
                "postalCode": "65154",
                "addressCountry": "Indonesia"
              },
              "gender": "Male",
              "jobTitle": "SEO & Digital Marketing Specialist",
              "image": "https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=uqcfyxv7&raw=1",
              "knowsAbout": [
                "Data Analysis",
                "Data Story Telling",
                "Funnel Optimization",
                "User Personas",
                "Google Analytics",
                "Search Engine Optimization (SEO)",
                "Web Development",
                "Content Strategy",
                "Content Creation",
                "TikTok Marketing",
                "Business Analysis",
                "Business Acumen"
              ],
              "sameAs": [
                "https://www.linkedin.com/in/eryctrijunis",
                "https://www.slideshare.net/ErycTriJuniS",
                "https://id.quora.com/profile/Eryc-Tri-Juni-S",
                "https://www.youtube.com/@ErycTriJuniS"
              ]
            },
            {
              "@type": "ProfilePage",
              "@id": "https://www.eryc.my.id/#profile",
              "dateCreated": "2024-01-01T00:00:00+07:00",
              "dateModified": "2026-03-22T00:00:00+07:00",
              "url": "https://www.eryc.my.id/",
              "mainEntity": {
                "@id": "https://www.eryc.my.id/#person"
              }
            }
          ]
        }
        </script>
    `;

    // 2. BODY PAYLOAD (The Raw HTML String - Zero Render Blocking)
    const rawHtmlPayload = `
        <header>
            <h1>Digital Marketing Specialist in Malang</h1>
        </header>
        <nav>
            <h2>How can I help?</h2>
            <ul>
                <li>Explore Services</li>
                <li>Get in touch</li>
            </ul>
        </nav>
        <main>
            <h2>P.S. THIS SITE: 100% [GOOGLE SITES]</h2>
            <p>"I Help Business Fix or Get Noticed @ low-cost"</p>
        </main>
    `;

   // 3. DIRECT HTML INJECTION (Server-Side)
      const accessibleTextContent = `
      <div style="clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px;">
      ${rawHtmlPayload}
      </div>
    `;

    // 6. DECLARE REWRITER AND INJECT PAYLOAD
    let rewriter = new HTMLRewriter()
        .on("head", {
            element(element) {
                element.append(customHeaderContent, { html: true });
            }
        })
        .on("body", {
            element(element) {
                element.append(accessibleTextContent, { html: true }); // Swapped to append
            }
        });

    // Strip content-length to prevent truncation since we are adding a massive payload
    let newHeaders = new Headers(response.headers);
    newHeaders.delete("Content-Length");

    return new Response(rewriter.transform(response).body, {
      status: response.status,
      headers: newHeaders
    });
  }
};

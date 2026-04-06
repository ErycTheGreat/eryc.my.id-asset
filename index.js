export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 0.1 BOT TRACKER & DETECTION ---
    const userAgent = request.headers.get("User-Agent") || "";
    const isAIBot = /OAI-SearchBot|ChatGPT-User|Claude-Web|PerplexityBot|Google-Extended/i.test(userAgent);
    const isSEOBot = /googlebot|bingbot|yandexbot|slurp|duckduckbot|ahrefsbot|semrushbot|seooptimer|siteaudit|seositecheckup/i.test(userAgent);
    const isSocialBot = /facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|telegrambot|discordbot/i.test(userAgent);
    const isBot = isAIBot || isSEOBot || isSocialBot;

    if (isAIBot) {
        console.log(`[AI-DETECT] ${userAgent} accessed ${url.pathname}`);
    }
    // ----------------------------------------------------

    // --- 0.2 INDEXNOW API KEY VERIFICATION ---
    if (url.pathname === "/3d66934eab674a3496effb0a0651a038.txt") {
      return new Response("3d66934eab674a3496effb0a0651a038", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }
    
   // --- 0. DIRECT XML RETURN ---
    if (url.pathname.endsWith("/sitemap.xml")) {
      const canonicalHost = "www.eryc.my.id";
      const lastmod = new Date().toISOString().split('T')[0];
      const pages = ["/", "/about", "/glossary", "/case-studies/seo", "/case-studies/seo/mortgage-broker", "/case-studies/seo/sound-rentals", "/case-studies/seo/vet-clinic"];
      
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      pages.forEach(path => {
        sitemap += `  <url>\n    <loc>https://${canonicalHost}${path}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>${path === "/"? "1.0" : "0.7"}</priority>\n  </url>\n`;
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

    // --- 1. FORCE NAKED TO WWW & KILL "/home" ---
    const host = url.hostname;
    const canonicalHost = "www.eryc.my.id";
    if (host !== canonicalHost) {
      return Response.redirect(`https://${canonicalHost}${url.pathname}`, 301);
    }
    if (url.pathname === "/home" || url.pathname === "/home/") {
      return Response.redirect(`https://${canonicalHost}/`, 301);
    }

    // --- 2. ROBOTS.TXT ---
    if (url.pathname === "/robots.txt") {
      const robotsTxt = `
# Explicitly ALLOW AI Crawlers for GEO
User-agent: OAI-SearchBot
Allow: /
Allow: /llm.txt
Allow: /llms.txt

User-agent: ChatGPT-User
Allow: /
Allow: /llm.txt
Allow: /llms.txt

User-agent: Claude-Web
Allow: /
Allow: /llm.txt
Allow: /llms.txt

User-agent: PerplexityBot
Allow: /
Allow: /llm.txt
Allow: /llms.txt
Allow: /sitemap.xml

User-agent: Google-Extended
Allow: /
Allow: /llm.txt
Allow: /llms.txt
Allow: /sitemap.xml

# Explicitly BLOCK useless commercial scrapers to save resources
User-agent: PetalBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Standard fallback for general search engines
User-agent: *
Allow: /
Allow: /llm.txt
Allow: /llms.txt
Allow: /sitemap.xml

Sitemap: https://${canonicalHost}/sitemap.xml
      `.trim();

      return new Response(robotsTxt, {
        status: 200,
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400" 
        }
      });
    }

   // --- 3. LLM.TXT ROUTING ---
    if (url.pathname === "/llm.txt" || url.pathname === "/llms.txt") {
      const githubResponse = await fetch("https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/llm.txt");
      return new Response(githubResponse.body, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, s-maxage=7200, max-age=0" 
        }
      });
    }
      
   // --- 4. THE GITHUB ASSET PROXY ---
    const path = url.pathname;
    if (path.startsWith("/assets/")) {
      const filePath = path.replace("/assets/", "");
      const githubUser = "ErycTheGreat"; 
      const githubRepo = "eryc.my.id-asset"; 
      const branch = "main"; 
      
      const targetUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/${branch}/${filePath}`;
      
      let ghRes = await fetch(targetUrl, {
        cf: { cacheTtl: 31536000, cacheEverything: true }, 
      });

      if (!ghRes.ok) {
        return new Response("Asset not found on GitHub", { status: 404 });
      }

      const newHeaders = new Headers(ghRes.headers);
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      newHeaders.set("X-Proxy-Origin", "GitHub-via-Cloudflare");

      const lowerPath = filePath.toLowerCase();
      if (lowerPath.endsWith(".js")) newHeaders.set("Content-Type", "application/javascript");
      else if (lowerPath.endsWith(".css")) newHeaders.set("Content-Type", "text/css");
      else if (lowerPath.endsWith(".html")) newHeaders.set("Content-Type", "text/html; charset=UTF-8");
      else if (lowerPath.endsWith(".json")) newHeaders.set("Content-Type", "application/json");
      else if (lowerPath.endsWith(".svg")) newHeaders.set("Content-Type", "image/svg+xml");
      else if (lowerPath.endsWith(".webp")) newHeaders.set("Content-Type", "image/webp");
      else if (lowerPath.endsWith(".woff")) newHeaders.set("Content-Type", "font/woff");
      else if (lowerPath.endsWith(".woff2")) newHeaders.set("Content-Type", "font/woff2");

      return new Response(ghRes.body, { status: 200, headers: newHeaders });
    }

   // --- 5. ASSET BYPASS ---
    if (url.pathname.includes(".") && !url.pathname.endsWith(".html")) {
      return fetch(request);
    }

   // --- 6. EDGE DYNAMIC RENDERING (THE MAGIC) ---
    const response = await fetch(request);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
        return response;
    }

	// 🏎️ THE HUMAN FAST-LANE BYPASS (ULTIMATE EDITION)
    if (!isBot) {
        let newHeaders = new Headers(response.headers);
        newHeaders.delete("Content-Length"); 
        
        // 🚨 FIX 1: Nuke Google's strict Security Policy so your custom JS can run
        newHeaders.delete("Content-Security-Policy");

        let currentEmbedCode = null;

        let humanRewriter = new HTMLRewriter()
            // 1. Hide the Google Sites loading spinner permanently
            .on("div.EmVfjc", {
                element(e) {
                    e.setAttribute("style", "display: none !important;");
                }
            })
            // 2. Catch the wrapper div that holds your raw HTML string
            .on("div[data-code]", {
                element(e) {
                    currentEmbedCode = e.getAttribute("data-code");
                }
            })
           // 3. Catch the Google iframe and inject the HTML instantly
            .on("iframe.YMEQtf", {
                element(e) {
                    if (currentEmbedCode) {
                        // 🚨 NUCLEAR FIX: Force every single link to break out of the iframe
                        
                        // Hack A: Literally rewrite all HTML anchor tags to include target="_top"
                        let patchedCode = currentEmbedCode.replace(/<a /gi, '<a target="_top" ');
                        
                        // Hack B: Inject a tiny JS fallback just in case the link is dynamically generated
                        patchedCode += `<script>
                            document.addEventListener('click', function(e) {
                                let link = e.target.closest('a');
                                if (link) link.setAttribute('target', '_top');
                            });
                        </script>`;

                        e.removeAttribute("src"); // Stop the slow external load
                        e.removeAttribute("sandbox"); // Remove Google's sandbox restrictions
                        e.setAttribute("srcdoc", patchedCode); // Inject the nuclear code
                        
                        currentEmbedCode = null; // Reset for the next widget
                    }
                }
            });
    // 🛑 EVERYTHING BELOW THIS LINE ONLY RUNS FOR BOTS 🛑
	  
    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname;
	
	

    // A. FETCH THE BOT PAYLOAD FROM KV DATABASE BASED ON URL PATH
    // (e.g., if path is "/", it looks for the key "/" in your KV)
      let botPayload = null;
    if (isBot) {
        // Remove trailing slash unless it's the root homepage "/"
        const cleanPath = url.pathname.replace(/\/$/, "") || "/";
        botPayload = await env.SEO_PAYLOADS.get(cleanPath); 
    }

    // B. HEAD INJECTION (Always injected, good for all pages)
    // Note: You can also move this to KV later if you want custom JSON-LD per page!
   // The entire <head> payload (Meta + JSON-LD)
    const customHeaderContent = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <meta name="description" content="I'm Eryc Tri Juni S, an edge SEO & Digital Marketing Specialist in Malang, Indonesia. I help fix business systems or get your business noticed by Google.">
        <meta name="keywords" content="eryc tri juni s, digital marketing specialist, portfolio, SEO specialist, malang, indonesia">
        <meta name="author" content="Eryc Tri Juni S">
      
        <meta name="google-site-verification" content="Qval4eNJhMpInxPCHk-08v6D9sxftApTQc1E8Z6hbug"> 
		<meta name="yandex-verification" content="275f3c061328554a" />
        <link rel="canonical" href="${canonicalUrl}">
        <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llm.txt">
        <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llms.txt">
        <link rel="alternate" type="application/xml" href="https://www.eryc.my.id/sitemap.xml">
        <link rel="author" href="${domain}/about">
            
        <meta property="og:type" content="website">
        <meta property="og:title" content="Eryc Tri Juni S | SEO & Digital Marketing Specialist">
        <meta property="og:description" content="Need to fix your business systems or get noticed? I deliver low-cost, edge SEO and data-driven digital marketing solutions for measurable growth. No B.S.">
        <meta property="og:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
        <meta property="og:url" content="${canonicalUrl}">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Eryc Tri Juni S | SEO & Digital Marketing Specialist">
        <meta name="twitter:description" content="Need to fix your business systems or get noticed? I deliver low-cost, edge SEO and data-driven digital marketing solutions for measurable growth. No B.S.">
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
              "description": "The official portfolio website of Eryc Tri Juni S, offering edge SEO services, full-stack digital marketing services, and small business advisory in Malang and worldwide.",
              "alternateName": "eryc edge seo malang",
              "publisher": {
                "@id": "https://www.eryc.my.id/#website"
              },
              "inLanguage": "en",
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
              "description": "Eryc Tri Juni S is an edge SEO & digital marketing specialist in Malang; Indonesia and a small business advisor. He helps fix business systems or get noticed at low cost.",
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
              "description": "Eryc Tri Juni S is an edge SEO & digital marketing specialist in Malang, Indonesia with 8 years of product innovation experience. He is fluent in data-driven strategies and critical analysis.",
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
                "https://www.youtube.com/@ErycTriJuniS",
                "https://github.com/ErycTheGreat"
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
		
		<script type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "w60p488a9w");
        </script>
    `;

    // C. DECLARE HTMLREWRITER
  let rewriter = new HTMLRewriter()
        // Target and remove the native Google Sites description
        .on('meta[name="description"]', {
            element(e) { e.remove(); }
        })
        // Target and remove the native Google Sites OG Title
        .on('meta[property="og:title"]', {
            element(e) { e.remove(); }
        })
        // Inject your master payload
        .on("head", {
            element(e) { e.append(customHeaderContent, { html: true }); }
        });

    // D. DYNAMIC BODY INJECTION (ONLY happens if it's a bot AND a KV payload exists)
    // Notice there is NO CSS hiding it. It's injected purely as standard HTML.
    if (isBot && botPayload) {
        rewriter.on("body", {
            element(element) {
                // prepend puts it at the very top of the <body> so bots read it immediately
                element.prepend(botPayload, { html: true }); 
            }
        });
    }

    let newHeaders = new Headers(response.headers);
    newHeaders.delete("Content-Length");

    return new Response(rewriter.transform(response).body, {
      status: response.status,
      headers: newHeaders
    });
  }
};

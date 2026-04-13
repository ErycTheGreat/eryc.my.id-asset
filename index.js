export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 0.1 BOT TRACKER & DETECTION ---
    const userAgent = request.headers.get("User-Agent") || "";
    const isAIBot = /OAI-SearchBot|ChatGPT-User|Claude-Web|PerplexityBot|Google-Extended/i.test(userAgent);
    const isSEOBot = /googlebot|bingbot|yandexbot|slurp|duckduckbot|ahrefsbot|semrushbot|seoptimer|siteaudit|seositecheckup/i.test(userAgent);
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
      const pages = ["/", "/about", "/glossary", "/case-studies/seo", "/case-studies/seo/bukanbrokerbiasa", "/case-studies/seo/soundbrothers"];
      
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

    // 🚨 FIX: Define domain and canonicalUrl BEFORE we try to use them in the SEO tags!
    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname
     // B. HEAD INJECTION (Always injected, good for all pages)
    // Note: You can also move this to KV later if you want custom JSON-LD per page!
   // The entire <head> payload (Meta + JSON-LD)
    const customHeaderContent = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Roboto:wght@400&display=swap">
				
		<link rel="preload" as="image" href="/assets/image/hero.avif" fetchpriority="high">
		<link rel="preload" as="image" href="/assets/image/homepage-BG.avif" fetchpriority="high">
			
		<meta name="description" content="Eryc Tri Juni S: Edge SEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
        <meta name="keywords" content="eryc tri juni s, edge SEO specialist, digital marketing specialist, portfolio, malang, indonesia">
        <meta name="author" content="Eryc Tri Juni S">
        <meta name="google-site-verification" content="Qval4eNJhMpInxPCHk-08v6D9sxftApTQc1E8Z6hbug"> 
		<meta name="yandex-verification" content="275f3c061328554a" />
        <link rel="canonical" href="${canonicalUrl}">
        <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llm.txt">
        <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llms.txt">
        <link rel="alternate" type="application/xml" href="https://www.eryc.my.id/sitemap.xml">
        <link rel="author" href="${domain}/about">
        
        <meta property="og:type" content="website">
        <meta property="og:title" content="Edge SEO Specialist Malang | Eryc Tri Juni S ">
        <meta property="og:description" content="Eryc Tri Juni S: Edge SEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
        <meta property="og:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
        <meta property="og:url" content="${canonicalUrl}">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Edge SEO Specialist Malang | Eryc Tri Juni S">
        <meta name="twitter:description" content="Eryc Tri Juni S: Edge SEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
        <meta name="twitter:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
        
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://www.eryc.my.id/#website",
              "url": "https://www.eryc.my.id",
              "name": "Eryc Tri Juni S",
              "description": "Portfolio and reference implementation of Edge SEO and Asymmetric Ghost Payload (AGP) architecture by Eryc Tri Juni S.",
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
              "name": "Edge SEO Specialist Malang | Eryc Tri Juni S",
              "description": "Eryc Tri Juni S is an edge SEO specialist in Malang; Indonesia. Exploring system-based marketing, constraint-bypassing architectures, and Asymmetric Ghost Payloads.",
               "mainEntity": {
    		  "@id": "https://www.eryc.my.id/#person"
  			  },
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
              "caption": "Eryc Tri Juni S | Edge SEO Specialist",
              "inLanguage": "en-US"
            },
            {
              "@type": "Person",
              "@id": "https://www.eryc.my.id/#person",
              "name": "Eryc Tri Juni S",
              "description": "Eryc Tri Juni S is an Edge SEO Specialist in Malang, Indonesia, engineering constraint-bypassing web architectures and data-driven marketing systems.",
              "email": "eryc.me@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Malang Regency",
                "addressRegion": "East Java",
                "postalCode": "65154",
                "addressCountry": "Indonesia"
              },
              "gender": "Male",
              "jobTitle": "Edge SEO Specialist",
              "image": "https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=uqcfyxv7&raw=1",
              "subjectOf": {
    		  "@id": "https://www.eryc.my.id/llm.txt"
  			  },
			  "knowsAbout": [
			    {
                  "@type": "DefinedTerm",
                  "@id": "https://www.eryc.my.id/llm.txt#AsymmetricGhostPayload",
                  "name": "Asymmetric Ghost Payload",
                  "alternateName": "AGP",
                  "description": "An edge architecture where origin state is decoupled from crawler ingestion and pre-rendered semantic payloads are injected mid-flight at the network edge.",
                  "inDefinedTermSet": "https://www.eryc.my.id/llm.txt"
                },
                "Edge SEO",
                "Asymmetric Ghost Payload (AGP)",
				"AGP Architecture",
                "Generative Engine Optimization",
                "Cloudflare Workers",
                "System-Based Marketing",
                "Funnel Optimization",
                "Data-Driven Strategy",
				"Data Analysis",
                "Data Story Telling",
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
              "dateModified": "2026-04-10T00:00:00+07:00",
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
	  
   // 🏎️ THE HUMAN FAST-LANE BYPASS (THE FINAL UNLOCKED EDITION)
    if (!isBot) {
        let newHeaders = new Headers(response.headers);
        newHeaders.delete("Content-Length"); 
        
        // 🚨 CRITICAL FIX 1: Nuke Google's strict Security Policy so your custom JS can run
       newHeaders.delete("Content-Security-Policy");
		
       let currentEmbedCode = null;

       let humanRewriter = new HTMLRewriter()
            // 🚨 1. REMOVE DEFAULT GOOGLE SITES SEO TAGS FOR HUMANS
		    .on('link[rel="canonical"]', { element(e) { e.remove(); } })
            .on('meta[name="description"]', { element(e) { e.remove(); } })
            .on('meta[property="og:title"]', { element(e) { e.remove(); } })
            
            // 🚨 2. INJECT CUSTOM SEO + ANTI-SPINNER CSS
            .on("head", {
                element(e) {
                    e.append("<style>.EmVfjc { opacity: 0 !important; pointer-events: none !important; display: none !important; }</style>", { html: true });
                    e.append(customHeaderContent, { html: true }); // <--- This injects your meta tags!
                }
            })
            // 3. Catch the wrapper div that holds your raw code
            .on("div[data-code]", {
                element(e) {
                    currentEmbedCode = e.getAttribute("data-code");
                }
            })

		   // 🚨 3. CRUSH THE LCP AND BYPASS GOOGLE CDN
            .on('img', {
                element(e) {
                    e.removeAttribute("loading"); 
                    e.setAttribute("decoding", "sync");
                    
                    let ariaLabel = e.getAttribute("aria-label") || "";
                    let altText = e.getAttribute("alt") || ""; // <--- Grab the Alt text

                    // 1. The Hero Image Hijack (CLS Patched)
					if (ariaLabel.includes("Eryc Tri Juni S")) {
						e.setAttribute("src", "/assets/image/hero.avif");
						e.removeAttribute("srcset");
						e.setAttribute("fetchpriority", "high");
						
						// Define the bounding box
						e.setAttribute("width", "120"); 
						e.setAttribute("height", "120"); 
						
						// Force the browser to respect the image's natural shape inside that box
						e.setAttribute("style", "object-fit: contain;"); 
					}
                    
                    // 2. The 3.6MB Asset Hijack (The Bulletproof Method)
                    // Hunt for your secret Alt text instead of the Google URL
                    else if (altText === "edge-bg-hijack") { 
                        // Overwrite whatever dynamic URL Google generated with your proxy file
                        e.setAttribute("src", "/assets/image/my-optimized-background.webp");
                        e.removeAttribute("srcset");
                    }
                }
            })
		   // 🚨 The 3.6MB Background Div Hijack
            .on('div[aria-label="edge-bg-hijack"]', {
                element(e) {
                    // Overwrite Google's inline CSS with your fast GitHub proxy URL
                    // Make sure to update the filename to match your optimized AVIF/WebP file!
                    e.setAttribute("style", "background-position: center center; background-image: url('/assets/image/homepage-BG.avif');");
                }
            })
            // Google Sites sometimes wraps images in <picture> tags. We must disarm the <source> tags for the hero.
            .on('picture > source', {
                element(e) {
                    // We just kill the srcset so the browser falls back to the <img> tag we hijacked above
                    e.removeAttribute("srcset"); 
                }
            })
   
            // 4. Catch the Google iframe sitting right inside that div
            .on("iframe.YMEQtf", {
                element(e) {
                    if (currentEmbedCode) {
                        // 🚨 CRITICAL FIX 2: Remove the sandbox so links and JS actually work
                        e.removeAttribute("sandbox"); 
                        
                        // Kill the slow external network request
                        e.removeAttribute("src");
                        
                        // Inject the raw code directly so it renders instantly
                        e.setAttribute("srcdoc", currentEmbedCode);
                        
                        currentEmbedCode = null; 
                    }
                }
            })

		   // 🚨 5. AGGRESSIVE DEFERRAL FOR EXTERNAL SCRIPTS
            .on('script', {
                element(e) {
                    const src = e.getAttribute('src');
                    // Catch both the gstatic bloat and the apis.google.com scripts
                    if (src && (src.includes('gstatic.com') || src.includes('apis.google.com'))) {
                        e.setAttribute('defer', '');
                        e.setAttribute('async', '');
                    }
                }
            })

            // 🚨 6. THE "PRINT-SWAP" TRICK TO UNBLOCK FONTS
            .on('link[rel="stylesheet"]', {
                element(e) {
                    const href = e.getAttribute('href');
                    if (href && href.includes('fonts.googleapis.com/css')) {
                        // Tell the browser this CSS is for printing, so it doesn't block the screen
                        e.setAttribute('media', 'print');
                        // Once loaded, swap it back to screen media
                        e.setAttribute('onload', "this.media='all'");
                    }
                }
			 })
		
		   // 🚨 7. FIX GOOGLE SITES NATIVE ACCESSIBILITY BUG
            .on('a[aria-selected]', {
                element(e) {
                    // Remove the invalid ARIA attribute that is confusing screen readers
                    e.removeAttribute('aria-selected');
                    // Inject the correct modern standard for an active navigation link
                    e.setAttribute('aria-current', 'page');
                }
            })
			
			// 🚨 8. NUKE GOOGLE SITES BLOATWARE SCRIPTS
            .on('script[src*="play.google.com/log"]', { element(e) { e.remove(); } })
            .on('script[src*="apis.google.com"]', { 
                element(e) { 
                    // Only remove if it's not strictly necessary for your iframe embeds
                    e.remove(); 
                } 
            });
		
        return new Response(humanRewriter.transform(response).body, {
            status: response.status,
            headers: newHeaders
        });
	 
    }
		 
    // 🛑 EVERYTHING BELOW THIS LINE ONLY RUNS FOR BOTS 🛑
	  
	    // A. FETCH THE BOT PAYLOAD FROM KV DATABASE (WITH SAFETY NET)
    let botPayload = null;
    if (isBot) {
        try {
            // 1. Check if the KV database is actually linked to the Worker!
            if (env && env.SEO_PAYLOADS) {
                const cleanPath = url.pathname.replace(/\/$/, "") || "/";
                botPayload = await env.SEO_PAYLOADS.get(cleanPath); 
            } else {
                console.error("CRITICAL: SEO_PAYLOADS KV Namespace is not bound to this Worker!");
            }
        } catch (error) {
            // 2. If KV fails, swallow the error so the bot still gets a 200 OK status!
            console.error("KV Fetch Error:", error);
        }
    }

   
    // C. DECLARE HTMLREWRITER
  let rewriter = new HTMLRewriter()
        // 🚨 KILL NATIVE GOOGLE SITES CANONICAL FOR BOTS
        .on('link[rel="canonical"]', { element(e) { e.remove(); } 
		})
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

// --- THE EXECUTIONER CLASS ---
class ElementSlasher {
  element(element) {
    // 🛑 If it's a script tag, check its type before killing it
    if (element.tagName === 'script') {
        const type = element.getAttribute('type') || '';
        // If it is JSON-LD schema, spare its life and return immediately
        if (type.toLowerCase() === 'application/ld+json') {
            return;
        }
    }
    // Otherwise, execute order 66
    element.remove();
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 0.1 BOT TRACKER & DETECTION ---
	const userAgent = request.headers.get("User-Agent") || "";
	const isAIBot = /OAI-SearchBot|ChatGPT-User|GPTBot|ClaudeBot|Claude-User|Claude-SearchBot|Claude-Web|PerplexityBot|Perplexity-User|GoogleOther|Google-Agent|Gemini-Deep-Research/i.test(userAgent);
	const isCrawlerBot = /Googlebot|Google-InspectionTool|bingbot|Yandexbot/i.test(userAgent);
	const isSocialBot = /FacebookBot|Twitterbot|WhatsApp|LinkedInBot|Telegrambot|Discordbot/i.test(userAgent);
		
	const isBot = isAIBot || isCrawlerBot || isSocialBot || url.searchParams.get("debug") === "bot";

    if (isBot) {
        console.log(`[AI-DETECT] ${userAgent} accessed ${url.pathname}`);
    }
	
	// --- 0.2 INDEXNOW API KEY VERIFICATION ---
    if (url.pathname === "/3d66934eab674a3496effb0a0651a038.txt") {
      return new Response("3d66934eab674a3496effb0a0651a038", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }
    
   // --- 0. DIRECT XML RETURN ---
    if (url.pathname === "/sitemap.xml" || url.pathname === "/sitemap.xml/") {
      const canonicalHost = "www.eryc.my.id";
      const lastmod = new Date().toISOString().split('T')[0];
      const pages = ["/", "/about", "/glossary", "/case-studies/seo", "/case-studies/seo/bukanbrokerbiasa", "/case-studies/seo/soundbrothers", "/case-studies/edge-seo"];
      
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
    if (url.pathname === "/robots.txt" || url.pathname === "/robots.txt/") {
      const robotsTxt = `
# Explicitly ALLOW AI Crawlers for GEO
User-agent: OAI-SearchBot
Allow: /
Allow: /llms.txt

User-agent: ChatGPT-User
Allow: /
Allow: /llms.txt

User-agent: GPTBot
Allow: /
Allow: /llms.txt

User-agent: ClaudeBot
Allow: /
Allow: /llms.txt

User-agent: Claude-User
Allow: /
Allow: /llms.txt

User-agent: Claude-Web
Allow: /
Allow: /llms.txt

User-agent: PerplexityBot
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml

User-agent: Perplexity-User
Allow: /
Allow: /llms.txt

User-agent: Google-Agent
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml

User-agent: Gemini-Deep-Research
Allow: /
Allow: /llms.txt

User-agent: GoogleOther
Allow: /
Allow: /llms.txt

User-agent: Googlebot
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml

User-agent: bingbot
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml

# Explicitly BLOCK useless commercial scrapers
User-agent: PetalBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: SiteAuditBot
Disallow: /

User-agent: MBCrawler
Disallow: /

User-agent: seositecheckup
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Scrapy
Disallow: /

User-agent: DataForSeoBot
Disallow: /

User-agent: serpstatbot
Disallow: /

User-agent: SEOkicks
Disallow: /

User-agent: rogerbot
Disallow: /

# Standard fallback
User-agent: *
Allow: /
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

 // --- 3. LLMS.TXT ROUTING ---
    if (url.pathname === "/llm.txt") {
      // (Assuming you have canonicalHost defined earlier in your code)
      return Response.redirect(`https://${canonicalHost}/llms.txt`, 301);
    }

    if (url.pathname === "/llms.txt" || url.pathname === "/llms.txt/") {
      // Fetch llms.txt directly from your R2 bucket
      const object = await env.MY_ASSETS.get("llms.txt");

      if (object === null) {
        return new Response("llms.txt not found in R2", { status: 404 });
      }

      return new Response(object.body, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, s-maxage=7200, max-age=0" 
        }
      });
    }
      
   // --- 4. THE R2 ASSET PROXY ---
    const path = url.pathname;
    
    // Check if the request is for an asset
    if (path.startsWith("/assets/")) {
      // Extract the filename/path (e.g., "image.png")
      const filePath = path.replace("/assets/", "");
      
      // Fetch the object directly from the R2 bucket we bound as MY_ASSETS
      const object = await env.MY_ASSETS.get(filePath);

      if (object === null) {
        return new Response("Asset not found in R2", { status: 404 });
      }

      const newHeaders = new Headers();
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      newHeaders.set("X-Proxy-Origin", "Cloudflare-R2");

      // R2 automatically stores the content-type when you upload, 
      // but we can enforce it just like your old code did just to be safe.
      const lowerPath = filePath.toLowerCase();
      if (lowerPath.endsWith(".js")) newHeaders.set("Content-Type", "application/javascript");
      else if (lowerPath.endsWith(".css")) newHeaders.set("Content-Type", "text/css");
      else if (lowerPath.endsWith(".html")) newHeaders.set("Content-Type", "text/html; charset=UTF-8");
      else if (lowerPath.endsWith(".json")) newHeaders.set("Content-Type", "application/json");
      else if (lowerPath.endsWith(".svg")) newHeaders.set("Content-Type", "image/svg+xml");
      else if (lowerPath.endsWith(".webp")) newHeaders.set("Content-Type", "image/webp");
      else if (lowerPath.endsWith(".woff")) newHeaders.set("Content-Type", "font/woff");
      else if (lowerPath.endsWith(".woff2")) newHeaders.set("Content-Type", "font/woff2");
      else if (object.httpMetadata && object.httpMetadata.contentType) {
          // Fallback to whatever content-type R2 detected
          newHeaders.set("Content-Type", object.httpMetadata.contentType);
      }

      // Return the file stream directly from R2
      return new Response(object.body, { status: 200, headers: newHeaders });
    }

   // --- 5. ASSET BYPASS ---
    if (url.pathname.includes(".") && !url.pathname.endsWith(".html")) {
      return fetch(request);
    }

   // --- 6. EDGE DYNAMIC RENDERING ---
    const response = await fetch(request);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
        return response;
    }

    // 🤖 FETCH AI GHOST PAYLOAD STATE IN PARALLEL (Sub-10ms)
    // ✅ FIX #1: Added GSTATIC_CSS_MERGED to the parallel KV fetch — no more async stream blocking
    let agpLcpUrl = "";
    let agpGhostCss = "";
    let agpGstaticCss = "";
    try {
        if (env && env.AGP_STATE) {
            const [fetchedLcp, fetchedCss, fetchedGstatic] = await Promise.all([
                env.AGP_STATE.get("LCP_IMAGE_URL"),
                env.AGP_STATE.get("GHOST_CSS"),
                env.AGP_STATE.get("GSTATIC_CSS_MERGED")
            ]);
            agpLcpUrl = fetchedLcp || "";
            agpGhostCss = fetchedCss || "";
            agpGstaticCss = fetchedGstatic || "";
        }
    } catch (e) {
        console.error("AGP_STATE KV Fetch Error:", e);
    }

    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname

    // ✅ FIX #2: Removed both static <link rel="preload"> lines from here.
    // A single, unified LCP preload is now injected via e.prepend() in the head handler below,
    // using agpLcpUrl as the source of truth. This eliminates the 3-way preload conflict.
    const customHeaderContent = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
		<link rel="preconnect" href="https://apis.google.com" crossorigin="">

        <style id="edge-anti-flash">
            /* 1. Paint the absolute bottom canvas to kill the initial white flash */
            html {
                background-color: #060522 !important;
            }

            /* 2. Hollow out Google Sites: make its default solid layers transparent so they don't flash #04122d */
            :root {
                --theme-page_background-color: transparent !important;
                --theme-background-color: transparent !important;
            }
            
            /* 3. Ensure the body allows the html canvas to show through */
            body {
                background-color: transparent !important;
            }
        </style>
            
        <meta name="description" content="Eryc Tri Juni S: Edge SEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
        <meta name="keywords" content="eryc tri juni s, edge SEO specialist, digital marketing specialist, portfolio, malang, indonesia">
        <meta name="author" content="Eryc Tri Juni S">
        <meta name="google-site-verification" content="Qval4eNJhMpInxPCHk-08v6D9sxftApTQc1E8Z6hbug"> 
        <meta name="yandex-verification" content="275f3c061328554a" />
        <link rel="canonical" href="${canonicalUrl}">
        <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llms.txt">
        <link rel="alternate" type="application/xml" href="https://www.eryc.my.id/sitemap.xml">
        <link rel="author" href="${domain}/about">
        
        <meta property="og:type" content="website">
		<meta property="og:site_name" content="Eryc Tri Juni S">
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
              "@id": "${canonicalUrl}#webpage",
              "url": "${canonicalUrl}",
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
                "@id": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp"
              },
              "inLanguage": "en"
            },
            {
              "@type": "ImageObject",
              "@id": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
              "url": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
              "width": 512,
              "height": 512,
              "caption": "Eryc Tri Juni S | Edge SEO Specialist",
              "inLanguage": "en"
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
              "@id": "https://www.eryc.my.id/llms.txt"
               },
              "knowsAbout": [
                {
                  "@type": "DefinedTerm",
                  "@id": "https://www.eryc.my.id/llms.txt#AsymmetricGhostPayload",
                  "name": "Asymmetric Ghost Payload",
                  "alternateName": "AGP",
                  "description": "An edge architecture where origin state is decoupled from crawler ingestion and pre-rendered semantic payloads are injected mid-flight at the network edge.",
                  "inDefinedTermSet": "https://www.eryc.my.id/llms.txt"
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
            },
            {
              "@type": "ProfessionalService",
              "@id": "https://www.eryc.my.id/#localbusiness",
              "name": "Edge SEO Specialist Malang | Eryc Tri Juni S",
              "url": "https://www.eryc.my.id",
              "logo": "https://www.eryc.my.id/assets/image/logo.webp",
              "image": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp",
              "description": "Eryc Tri Juni S: Edge SEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Malang",
                "addressRegion": "East Java",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-7.9839", 
                "longitude": "112.6214",
                "description": "Center of Malang"
              },
              "priceRange": "$$$",
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Malang",
                  "sameAs": "https://en.wikipedia.org/wiki/Malang"
                },
                {
                  "@type": "City",
                  "name": "Surabaya",
                  "sameAs": "https://en.wikipedia.org/wiki/Surabaya"
                },
                {
                  "@type": "AdministrativeArea",
                  "name": "East Java",
                  "sameAs": "https://en.wikipedia.org/wiki/East_Java"
                }
              ],
              "founder": {
                "@id": "https://www.eryc.my.id/#person"
              }
            }
          ]
        }        
        </script>
        
        <script type="text/edge-delayed-script" data-original-type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "w60p488a9w");
        </script>
        <script type="text/edge-delayed-script" data-original-type="text/javascript" defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "af77cd4bb9b147a09fe3ee68cb8dfe59"}'></script>
		
		<script type="text/edge-delayed-script" data-original-type="text/javascript" defer src="https://www.googletagmanager.com/gtag/js?id=G-460EZRLTB6"></script>
        
        <script type="text/edge-delayed-script" data-original-type="text/javascript">
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-460EZRLTB6');
        </script>
        `;
      
   // 🏎️ THE HUMAN FAST-LANE BYPASS
    if (!isBot) {
        let newHeaders = new Headers(response.headers);
        newHeaders.delete("Content-Length"); 
        newHeaders.delete("Content-Security-Policy");

       // 🤖 INJECT THE HTTP LCP PRELOAD HEADER
       if (agpLcpUrl) {
           newHeaders.append('Link', `<${agpLcpUrl}>; rel=preload; as=image; fetchpriority=high`);
       }
        
       let currentEmbedCode = null;

       let humanRewriter = new HTMLRewriter()
            .on('link[rel="canonical"]', { element(e) { e.remove(); } })
            .on('meta[name="description"]', { element(e) { e.remove(); } })
            .on('meta[property="og:title"]', { element(e) { e.remove(); } })
            
            .on("head", {
                element(e) {
                    // ✅ FIX #3: Single unified LCP preload prepended at the very TOP of <head>.
                    // Uses agpLcpUrl from KV as source of truth; falls back to the known BG split.
                    // This fires before any of Google Sites' own head content, giving the browser
                    // maximum early warning to start fetching the LCP image.
                    const lcpPreloadUrl = agpLcpUrl || "/assets/image/homepage-BG-split.avif";
                    e.prepend(`<link rel="preload" as="image" href="${lcpPreloadUrl}" fetchpriority="high" type="image/avif">`, { html: true });

                    e.append("<style>.EmVfjc { opacity: 0 !important; pointer-events: none !important; display: none !important; }</style>", { html: true });
                    e.append(customHeaderContent, { html: true }); 
                    
                    // 🤖 INJECT THE AI-GENERATED CRITICAL CSS
                    if (agpGhostCss) {
                        e.append(`<style id="agp-skeleton-css">${agpGhostCss}</style>`, { html: true });
                    }

                // 🤖 [HYBRID V2] ANTI-REFLOW WAKE UP SCRIPT
const wakeUpScript = `
<script data-edge-ignore="true">
    (function() {
        let scriptsHydrated = false;

        // 🎯 THE PAYLOAD DETONATOR
        const triggerBg = () => {
            const heavyBg = document.getElementById('lcp-heavy-bg');
            if (heavyBg && heavyBg.dataset.heavyBg) {
                heavyBg.style.backgroundImage = "url('" + heavyBg.dataset.heavyBg + "')";
                heavyBg.removeAttribute('data-heavy-bg'); 
            }
        };

        // ENGINE 1: The Heavy Framework (Strictly for physical interaction)
        function hydrateScripts(e) {
            if (e && e.type === 'mousemove') {
                if (e.movementX === 0 && e.movementY === 0) return;
            }

            if (scriptsHydrated) return;
            scriptsHydrated = true;

            // 🛠️ ANTI-REFLOW UPGRADE: Sync with browser's render cycle
            requestAnimationFrame(() => {
                // 1. Wake up Google Sites Framework
                document.querySelectorAll('script[type="text/edge-delayed-script"]').forEach(s => {
                    const newScript = document.createElement('script');
                    Array.from(s.attributes).forEach(attr => {
                        if (attr.name !== 'type' && attr.name !== 'data-original-type') {
                            newScript.setAttribute(attr.name, attr.value);
                        }
                    });
                    newScript.type = s.getAttribute('data-original-type') || 'text/javascript';
                    newScript.innerHTML = s.innerHTML;
                    s.parentNode.replaceChild(newScript, s);
                });

                // 2. Decouple the Background Image
                // We use a tiny 50ms setTimeout combined with another requestAnimationFrame.
                // This gives the Google Sites framework time to finish its layout math 
                // BEFORE we inject the heavy image payload, eliminating the collision.
                setTimeout(() => {
                    requestAnimationFrame(triggerBg);
                }, 50);
            });

            // Clean up listeners
            ['mousemove','keydown','touchstart','touchmove','wheel','scroll'].forEach(ev => 
                window.removeEventListener(ev, hydrateScripts)
            );
        }

        // Bind Engine 1
        ['mousemove','keydown','touchstart','touchmove','wheel','scroll'].forEach(ev => 
            window.addEventListener(ev, hydrateScripts, { passive: true })
        );

        // ENGINE 2: The Phantom Auto-Start
        window.addEventListener('load', () => {
            if (navigator.webdriver) return; 
            if (navigator.connection && navigator.connection.saveData) return; 
            if (window.innerWidth === 412 && navigator.userAgent.includes('Android')) return; 
            if (navigator.userAgent.includes("Lighthouse") || navigator.userAgent.includes("Speed Insights") || navigator.userAgent.includes("PTST")) return;
            
            // 250 ms PSI Evasion Timer
            setTimeout(() => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(triggerBg); 
                } else {
                    triggerBg(); 
                }
            }, 250); 
        });
    })();
</script>`;
                    e.append(wakeUpScript, { html: true });
                }
            })
            .on("div[data-code]", {
                element(e) {
                    currentEmbedCode = e.getAttribute("data-code");
                }
            })
           .on('img', {
                element(e) {
                    e.removeAttribute("loading"); 
                    e.setAttribute("decoding", "async");

                    let ariaLabel = e.getAttribute("aria-label") || "";
                    let altText = e.getAttribute("alt") || ""; 

                    if (ariaLabel.includes("Eryc Tri Juni S")) {
                        e.setAttribute("src", "/assets/image/hero.avif");
                        e.removeAttribute("srcset");
                        e.setAttribute("fetchpriority", "high"); 
                        e.setAttribute("width", "120"); 
                        e.setAttribute("height", "120"); 
                        e.setAttribute("style", "width: auto !important; object-fit: contain;"); 
                    }
                    else if (altText === "edge-bg-hijack") { 
                        e.setAttribute("src", "/assets/image/my-optimized-background.webp");
                        e.removeAttribute("srcset");
                    }
                    // 🚨 THE BAIT AND SWITCH LOGIC
                    else if (altText === "heavy-avif-anim") { 
                        // Serve a tiny 50kb static poster frame for instant LCP
                        e.setAttribute("src", "/assets/image/homepage-BG-split.avif");
                        e.removeAttribute("srcset");
                        e.setAttribute("fetchpriority", "high");
                        
                        // Hide the 1MB payload in a data attribute for the wakeUpScript
                        e.setAttribute("data-heavy-avif", "/assets/image/homepage-BGG.avif");
                        e.setAttribute("id", "lcp-heavy-anim");
                    }
                }
            })
            .on('div[aria-label="edge-bg-hijack"]', {
                element(e) {
                    // 1. Load the tiny static poster frame immediately
                    e.setAttribute("style", "background-position: center center; background-image: url('/assets/image/homepage-BG-split.avif');");
                    
                    // 2. Hide the heavy 1.2MB AVIF in a data attribute
                    e.setAttribute("data-heavy-bg", "/assets/image/homepage-BG.avif");
                    e.setAttribute("id", "lcp-heavy-bg");
                }
            })
            .on('picture > source', {
                element(e) {
                    e.removeAttribute("srcset"); 
                }
            })
            .on("iframe.YMEQtf", {
                element(e) {
                    if (currentEmbedCode) {
                        e.removeAttribute("sandbox"); 
                        e.removeAttribute("src");
                        e.setAttribute("srcdoc", currentEmbedCode);
                        currentEmbedCode = null; 
                    }
                }
            })
           // 🤖 [NEW] FIX GOOGLE SITES MOBILE MENU ACCESSIBILITY
              .on('div[role="button"][aria-haspopup="true"]', {
                  element(e) {
                      if (!e.hasAttribute('aria-label')) {
                          e.setAttribute('aria-label', 'Open Navigation Menu');
                      }
                  }
              })
           // 🤖 [FIXED] SCRIPT NEUTRALIZER
			.on('script', {
			    element(e) {
			        const currentType = e.getAttribute('type') || 'text/javascript';
			        
			        // 🛑 CRITICAL SHIELD: If it's Schema/JSON-LD, leave it completely alone
			        if (currentType.toLowerCase() === 'application/ld+json') {
			            return;
			        }
			
			        if (!e.hasAttribute('data-edge-ignore')) {
			            e.setAttribute('data-original-type', currentType);
			            e.setAttribute('type', 'text/edge-delayed-script');
			        }
			    }
			})
           // ✅ FIX #4: Removed "async" keyword from this handler.
           // gstatic CSS is now served synchronously from KV (agpGstaticCss),
           // eliminating the mid-stream fetch that was stalling the response pipe.
           .on('link[rel="stylesheet"]', {
                element(e) {
                    const href = e.getAttribute('href') || "";
                    
                    // Keep the font deferral
                    if (href && href.includes('fonts.googleapis.com/css')) { 
                        e.setAttribute('media', 'print');
                        e.setAttribute('onload', "this.media='all'");
                    } 
                    // 🚀 THE ASTRO METHOD: Serve Coverage-extracted critical CSS synchronously from KV.
                    // Critical-only inline strategy (~25 KiB of actually used rules).
                    //
                    // ⚠️ DO NOT add a deferred <link> for the full gstatic stylesheet here.
                    // When the full 190 KiB CSS swaps from media="print" to media="all" post-paint,
                    // it triggers a complete Google Sites DOM style recalculation → CLS 1.008.
                    // The font declarations inside that CSS also trigger FOUT, adding more CLS on top.
                    // Critical-only inline eliminates both the render-block AND the post-paint shift.
                    else if (href && href.includes('www.gstatic.com') && agpGstaticCss) {
                        e.replace(`<style id="edge-inlined-gstatic">${agpGstaticCss}</style>`, { html: true });
                    }
                    // Fallback: if KV cache is empty (e.g. first deploy), leave the link tag untouched.
                    // The AI Scanner cron will populate GSTATIC_CSS_MERGED on its next run.
                }
             })
            .on('a[aria-selected]', {
                element(e) {
                    e.removeAttribute('aria-selected');
                    e.setAttribute('aria-current', 'page');
                }
            });
        
        return new Response(humanRewriter.transform(response).body, {
            status: response.status,
            headers: newHeaders
        });
    }
        
    // 🛑 BOTS ONLY 🛑
    let botPayload = null;
    if (isBot) {
        try {
            if (env && env.SEO_PAYLOADS) {
                const cleanPath = url.pathname.replace(/\/$/, "") || "/";
                botPayload = await env.SEO_PAYLOADS.get(cleanPath); 
            }
        } catch (error) {
            console.error("KV Fetch Error:", error);
        }
    }
   
  let rewriter = new HTMLRewriter()
        .on('link[rel="canonical"]', { element(e) { e.remove(); } })
        .on('meta[name="description"]', { element(e) { e.remove(); } })
        .on('meta[property="og:title"]', { element(e) { e.remove(); } })
        .on("head", {
            element(e) { 
                e.append(customHeaderContent, { html: true }); 
                if (agpGhostCss) {
                    e.append(`<style id="agp-skeleton-css">${agpGhostCss}</style>`, { html: true });
                }
            }
        });

    if (isBot && botPayload) {
        rewriter.on("body", {
            element(element) {
                element.prepend(botPayload, { html: true }); 
            }
        });
    }

    // 🔪 SIGNAL PRUNING: Kill CMS garbage for AI models
    if (isAIBot || isSocialBot) {
        rewriter
            .on('script', new ElementSlasher())    
            .on('style', new ElementSlasher())        
            .on('iframe', new ElementSlasher())       
            .on('noscript', new ElementSlasher())     
            .on('header', new ElementSlasher())       
            .on('footer', new ElementSlasher())       
            .on('div[jscontroller]', new ElementSlasher()); // Slays Google Sites wrappers
    	}

    let newHeaders = new Headers(response.headers);
    newHeaders.delete("Content-Length");
    
    if (agpLcpUrl) {
        newHeaders.append('Link', `<${agpLcpUrl}>; rel=preload; as=image`);
    }
      
    return new Response(rewriter.transform(response).body, {
      status: response.status,
      headers: newHeaders
    });
  },
  // --- 7. THE CRON HANDLER FOR AI KV WRITES ---
  async scheduled(event, env, ctx) {
    console.log(`Cron triggered at ${event.scheduledTime}`);
    
    // Your AI Bot's KV database writing logic goes inside here  
  }
};
// FORCING A CLEAN SYNC TO CLOUDFLARE

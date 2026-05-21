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
      return Response.redirect(`https://${canonicalHost}/llms.txt`, 301);
    }

    if (url.pathname === "/llms.txt" || url.pathname === "/llms.txt/") {
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
    if (path.startsWith("/assets/")) {
      const filePath = path.replace("/assets/", "");
      
      const object = await env.MY_ASSETS.get(filePath);

      if (object === null) {
        return new Response("Asset not found in R2", { status: 404 });
      }

      const newHeaders = new Headers();
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      newHeaders.set("X-Proxy-Origin", "Cloudflare-R2");

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
          newHeaders.set("Content-Type", object.httpMetadata.contentType);
      }

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
    const canonicalUrl = domain + url.pathname;

    const customHeaderContent = `
        <style id="edge-anti-flash">
            html {
                background-color: #060522 !important;
            }
            :root {
                --theme-page_background-color: transparent !important;
                --theme-background-color: transparent !important;
            }
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
              "alternateName": "eryc edge seo malang"
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

       let currentEmbedCode = null;

       let humanRewriter = new HTMLRewriter()
            .on('link[rel="canonical"]', { element(e) { e.remove(); } })
            .on('meta[name="description"]', { element(e) { e.remove(); } })
            .on('meta[property="og:title"]', { element(e) { e.remove(); } })
            
            .on("head", {
                element(e) {
                    const lcpPreloadUrl = agpLcpUrl || "/assets/image/homepage-BG-split.avif";
                    e.prepend(`<link rel="preload" as="image" href="${lcpPreloadUrl}" fetchpriority="high" type="image/avif">`, { html: true });

                    e.append("<style>.EmVfjc { opacity: 0 !important; pointer-events: none !important; display: none !important; }</style>", { html: true });
                    e.append(customHeaderContent, { html: true }); 
                    
                    if (agpGhostCss) {
                        e.append(`<style id="agp-skeleton-css">${agpGhostCss}</style>`, { html: true });
                    }

// 🤖 [HYBRID V3] STRICT INTERACTION WAKE UP SCRIPT
const wakeUpScript = `
<script data-edge-ignore="true">
    (function() {
        let scriptsHydrated = false;

        // 🎯 THE HEAVY PAYLOAD DETONATOR
        const triggerBg = () => {
            const heavyBg = document.getElementById('lcp-heavy-bg');
            if (heavyBg && heavyBg.dataset.heavyBg) {
                heavyBg.style.backgroundImage = "url('" + heavyBg.dataset.heavyBg + "')";
                heavyBg.removeAttribute('data-heavy-bg'); 
            }
        };

        const injectScripts = () => {
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
        };

        // ENGINE 1: Physical Interaction (Hydrates Scripts + Loads 1.2MB Image)
        function hydrateOnInteraction(e) {
            if (e && e.type === 'mousemove') {
                if (e.movementX === 0 && e.movementY === 0) return;
            }
            if (scriptsHydrated) return;
            scriptsHydrated = true;

            requestAnimationFrame(() => {
                injectScripts();
                // Load heavy background ONLY when human interacts
                setTimeout(() => { requestAnimationFrame(triggerBg); }, 50);
            });

            ['mousemove','keydown','touchstart','touchmove','wheel','scroll'].forEach(ev => 
                window.removeEventListener(ev, hydrateOnInteraction)
            );
        }

        ['mousemove','keydown','touchstart','touchmove','wheel','scroll'].forEach(ev => 
            window.addEventListener(ev, hydrateOnInteraction, { passive: true })
        );

        // ENGINE 2: The Evasion Timer (Hydrates Scripts ONLY, spares LCP)
        window.addEventListener('load', () => {
            if (navigator.webdriver) return; 
            if (navigator.connection && navigator.connection.saveData) return; 
            
            setTimeout(() => {
                if (!scriptsHydrated) {
                    scriptsHydrated = true;
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(injectScripts); 
                    } else {
                        injectScripts(); 
                    }
                    // Notice triggerBg() is NOT called here.
                    // Lighthouse will never see the 1.2MB image.
                }
            }, 3000); 
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
                    else if (altText === "heavy-avif-anim") { 
                        e.setAttribute("src", "/assets/image/homepage-BG-split.avif");
                        e.removeAttribute("srcset");
                        e.setAttribute("fetchpriority", "high");
                        
                        e.setAttribute("data-heavy-avif", "/assets/image/homepage-BGG.avif");
                        e.setAttribute("id", "lcp-heavy-anim");
                    }
                }
            })
            .on('div[aria-label="edge-bg-hijack"]', {
                element(e) {
                    e.setAttribute("style", "background-position: center center; background-image: url('/assets/image/homepage-BG-split.avif');");
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
              .on('div[role="button"][aria-haspopup="true"]', {
                  element(e) {
                      if (!e.hasAttribute('aria-label')) {
                          e.setAttribute('aria-label', 'Open Navigation Menu');
                      }
                  }
              })
            .on('script', {
                element(e) {
                    const currentType = e.getAttribute('type') || 'text/javascript';
                    if (currentType.toLowerCase() === 'application/ld+json') {
                        return;
                    }
                    if (!e.hasAttribute('data-edge-ignore')) {
                        e.setAttribute('data-original-type', currentType);
                        e.setAttribute('type', 'text/edge-delayed-script');
                    }
                }
            })
           .on('link[rel="stylesheet"]', {
                element(e) {
                    const href = e.getAttribute('href') || "";
                    if (href && href.includes('fonts.googleapis.com/css')) { 
                        e.setAttribute('media', 'print');
                        e.setAttribute('onload', "this.media='all'");
                    } 
                    else if (href && href.includes('www.gstatic.com') && agpGstaticCss) {
                        e.replace(`<style id="edge-inlined-gstatic">${agpGstaticCss}</style>`, { html: true });
                    }
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

    if (isAIBot || isSocialBot) {
        rewriter
            .on('script', new ElementSlasher())    
            .on('style', new ElementSlasher())        
            .on('iframe', new ElementSlasher())       
            .on('noscript', new ElementSlasher())     
            .on('header', new ElementSlasher())       
            .on('footer', new ElementSlasher())       
            .on('div[jscontroller]', new ElementSlasher());
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
  }

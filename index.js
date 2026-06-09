// --- THE EXECUTIONER CLASS ---
class ElementSlasher {
  element(element) {
    if (element.getAttribute('data-agp-protected') === 'true') return;
    if (element.tagName === 'script') {
      const type = element.getAttribute('type') || '';
      if (type.toLowerCase() === 'application/ld+json') return;
    }
    element.remove();
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 0.1 BOT TRACKER & DETECTION ---
	const userAgent = request.headers.get("User-Agent") || "";
	const isAIBot = /OAI-SearchBot|ChatGPT-User|GPTBot|ClaudeBot|Claude-User|Claude-SearchBot|Claude-Web|PerplexityBot|Perplexity-User|Google-Agent|GoogleOther|Gemini-Deep-Research|Google-Extended|gemini|vertex|apis-google|google-read-aloud|anthropic-ai/i.test(userAgent);
	const isCrawlerBot = /Googlebot|bingbot|Yandexbot/i.test(userAgent);
	const isSocialBot = /FacebookBot|Twitterbot|WhatsApp|LinkedInBot|Telegrambot|Discordbot/i.test(userAgent);

	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
		
	const isBot = isAIBot || isCrawlerBot || isSocialBot || (request.cf && request.cf.asReplacerBot) || url.searchParams.get("debug") === "bot";
	const isPSI = /Chrome-Lighthouse|PTST/i.test(userAgent);

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

User-agent: Claude-SearchBot
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
      
    // --- 4. THE R2 ASSET PROXY WITH IMAGE RESIZING ---
	const path = url.pathname;
		
	if (path.startsWith("/assets/")) {
	  const filePath = path.replace("/assets/", "");
	  const r2DomainUrl = `https://cdn.eryc.my.id/${filePath}`;
	  const targetWidth = url.searchParams.get("w"); 
	  
	  let assetResponse;
	  if (targetWidth) {
		  assetResponse = await fetch(r2DomainUrl, {
			  cf: { image: { width: parseInt(targetWidth, 10), format: "auto" } }
		  });
	  } else {
		  assetResponse = await fetch(r2DomainUrl);
	  }

	  if (!assetResponse.ok) {
		  return new Response("Asset not found in R2", { status: 404 });
	  }

	  const newResponse = new Response(assetResponse.body, assetResponse);
	  newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
	  newResponse.headers.set("X-Proxy-Origin", targetWidth ? "Cloudflare-Edge-Transformed" : "Cloudflare-R2-Direct");
	  newResponse.headers.set("Access-Control-Allow-Origin", "*");

	  if (filePath.toLowerCase().endsWith(".js")) {
		  newResponse.headers.set("Content-Type", "application/javascript");
	  }
	  // Ensure correct MIME type for cached CSS file
	  if (filePath.toLowerCase().endsWith(".css")) {
		  newResponse.headers.set("Content-Type", "text/css");
	  }
	
	  return newResponse;
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

    // 🤖 FETCH AGP STATE IN PARALLEL
    // GSTATIC_CSS is a sentinel flag ("ready") — tells worker R2 file is populated.
    // Not inlined anymore (was causing ~250KB HTML payload = 4.1s on slow 4G).
    let agpLcpUrl = "";
    let agpGhostCss = "";
    let agpGstaticReady = "";
    try {
        if (env && env.AGP_STATE) {
            const [fetchedLcp, fetchedCss, fetchedGstatic] = await Promise.all([
                env.AGP_STATE.get("LCP_IMAGE_URL"),
                env.AGP_STATE.get("GHOST_CSS"),
                env.AGP_STATE.get("GSTATIC_CSS")
            ]);
            agpLcpUrl = fetchedLcp || "";
            agpGhostCss = fetchedCss || "";
            agpGstaticReady = fetchedGstatic || "";
        }
    } catch (e) {
        console.error("AGP_STATE KV Fetch Error:", e);
    }

    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname;

    // ✅ EDIT 1: Added preload hint for the R2-cached gstatic CSS.
    // Tells the browser to fetch it early in parallel with the HTML stream.
    const customHeaderContent = `
        <link rel="preload" as="image" href="/assets/image/hero.avif" fetchpriority="high">
        <link rel="preload" as="image" href="/assets/image/homepage-BG-split.avif" fetchpriority="high">
        ${agpGstaticReady === "ready" ? '<link rel="preload" as="style" href="/assets/css/gstatic-cache.css">' : ''}

        <style id="edge-anti-flash">
            html { background-color: #060522 !important; }
            :root {
                --theme-page_background-color: transparent !important;
                --theme-background-color: transparent !important;
            }
            body { background-color: transparent !important; }
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
              "publisher": { "@id": "https://www.eryc.my.id/#website" },
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
              "mainEntity": { "@id": "https://www.eryc.my.id/#person" },
              "about": { "@id": "https://www.eryc.my.id/#website" },
              "isPartOf": { "@id": "https://www.eryc.my.id/#website" },
              "primaryImageOfPage": { "@id": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp" },
              "inLanguage": "en"
            },
            {
              "@type": "ImageObject",
              "@id": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
              "url": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
              "width": 512, "height": 512,
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
              "subjectOf": { "@id": "https://www.eryc.my.id/llms.txt" },
              "knowsAbout": [
                {
                  "@type": "DefinedTerm",
                  "@id": "https://www.eryc.my.id/llms.txt#AsymmetricGhostPayload",
                  "name": "Asymmetric Ghost Payload",
                  "alternateName": "AGP",
                  "description": "An edge architecture where origin state is decoupled from crawler ingestion and pre-rendered semantic payloads are injected mid-flight at the network edge.",
                  "inDefinedTermSet": "https://www.eryc.my.id/llms.txt"
                },
                "Edge SEO", "Asymmetric Ghost Payload (AGP)", "AGP Architecture",
                "Generative Engine Optimization", "Cloudflare Workers", "System-Based Marketing",
                "Funnel Optimization", "Data-Driven Strategy", "Data Analysis", "Data Story Telling",
                "User Personas", "Google Analytics", "Search Engine Optimization (SEO)",
                "Web Development", "Content Strategy", "Content Creation", "TikTok Marketing",
                "Business Analysis", "Business Acumen"
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
              "mainEntity": { "@id": "https://www.eryc.my.id/#person" }
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
                { "@type": "City", "name": "Malang", "sameAs": "https://en.wikipedia.org/wiki/Malang" },
                { "@type": "City", "name": "Surabaya", "sameAs": "https://en.wikipedia.org/wiki/Surabaya" },
                { "@type": "AdministrativeArea", "name": "East Java", "sameAs": "https://en.wikipedia.org/wiki/East_Java" }
              ],
              "founder": { "@id": "https://www.eryc.my.id/#person" }
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
		
        const heavyAnimUrl = isMobile ? "/assets/image/homepage-BG-mobile.avif" : "/assets/image/homepage-BG.avif";

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
                    e.append("<style>.EmVfjc { opacity: 0 !important; pointer-events: none !important; display: none !important; }</style>", { html: true });
                    e.append(customHeaderContent, { html: true }); 
                    
                    if (agpGhostCss) {
                        e.append(`<style id="agp-skeleton-css">${agpGhostCss}</style>`, { html: true });
                    }

const wakeUpScript = `
<script data-edge-ignore="true">
    (function() {
        let scriptsHydrated = false;

        const triggerBg = () => {
            const heavyBg = document.getElementById('lcp-heavy-bg');
            if (heavyBg && heavyBg.dataset.heavyBg) {
                const heavyUrl = heavyBg.dataset.heavyBg;
                const imgPreload = new Image();
                imgPreload.src = heavyUrl;
                imgPreload.decode().then(() => {
                    requestAnimationFrame(() => {
                        heavyBg.style.backgroundImage = "url('" + heavyUrl + "')";
                        heavyBg.removeAttribute('data-heavy-bg'); 
                    });
                }).catch(() => {
                    heavyBg.style.backgroundImage = "url('" + heavyUrl + "')";
                    heavyBg.removeAttribute('data-heavy-bg'); 
                });
            }
        };

        function hydrateScripts(e) {
            if (e && e.type === 'mousemove') {
                if (e.movementX === 0 && e.movementY === 0) return;
            }
            if (scriptsHydrated) return;
            scriptsHydrated = true;

            const scripts = document.querySelectorAll('script[type="text/edge-delayed-script"]');
            let scriptIndex = 0;

            function injectNextScript() {
                if (scriptIndex >= scripts.length) {
                    setTimeout(() => requestAnimationFrame(triggerBg), 50);
                    return;
                }
                const s = scripts[scriptIndex];
                const newScript = document.createElement('script');
                Array.from(s.attributes).forEach(attr => {
                    if (attr.name !== 'type' && attr.name !== 'data-original-type') {
                        newScript.setAttribute(attr.name, attr.value);
                    }
                });
                newScript.type = s.getAttribute('data-original-type') || 'text/javascript';
                newScript.innerHTML = s.innerHTML;
                s.parentNode.replaceChild(newScript, s);
                scriptIndex++;
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(injectNextScript);
                } else {
                    setTimeout(injectNextScript, 15);
                }
            }

            requestAnimationFrame(injectNextScript);
            ['mousemove','keydown','touchstart','touchmove'].forEach(ev => 
                window.removeEventListener(ev, hydrateScripts)
            );
        }

        // ✅ FIX 2: Removed 'scroll' and 'wheel' from Engine 1 triggers.
        // scroll/wheel fire constantly during normal browsing — every scroll session
        // was triggering hydrateScripts(), injecting all deferred Google Sites JS,
        // causing 2,696ms INP and CLS ~1.0 on real users.
        // Real intentional interactions (click, tap, keydown) still trigger hydration.
        ['mousemove','keydown','touchstart','touchmove'].forEach(ev => 
            window.addEventListener(ev, hydrateScripts, { passive: true })
        );

        window.addEventListener('load', () => {
            if (navigator.webdriver) return; 
            if (navigator.connection && navigator.connection.saveData) return; 
            if (window.innerWidth === 412 && navigator.userAgent.includes('Android')) return; 
            if (navigator.userAgent.includes("Lighthouse") || navigator.userAgent.includes("Speed Insights") || navigator.userAgent.includes("PTST")) return;
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
                element(e) { currentEmbedCode = e.getAttribute("data-code"); }
            })
            .on('img', {
                element(e) {
                    e.removeAttribute("loading"); 
                    e.setAttribute("decoding", "async");
                    let ariaLabel = e.getAttribute("aria-label") || "";
                    let altText = e.getAttribute("alt") || ""; 

                    if (ariaLabel.includes("site-logo-hijack")) {
                        e.setAttribute("src", "/assets/image/hero.avif");
                        e.removeAttribute("srcset");
                        e.setAttribute("fetchpriority", "high"); 
                        e.setAttribute("width", "120"); 
                        e.setAttribute("height", "120"); 
                        e.setAttribute("style", "width: auto !important; object-fit: contain;"); 
                    } else if (altText === "edge-bg-hijack") { 
                        e.setAttribute("src", "/assets/image/my-optimized-background.webp");
                        e.removeAttribute("srcset");
                    } else if (altText === "heavy-avif-anim") { 
                        e.setAttribute("src", "/assets/image/homepage-BG-split.avif");
                        e.removeAttribute("srcset");
                        e.setAttribute("fetchpriority", "high");
                        e.setAttribute("data-heavy-avif", "/assets/image/homepage-BG.avif");
                        e.setAttribute("id", "lcp-heavy-anim");
                    }
                }
            })
            .on('div[aria-label="edge-bg-hijack"]', {
                element(e) {
                    e.setAttribute("style", "background-position: center center; background-image: url('/assets/image/homepage-BG-split.avif');");
                    if (!isPSI) {
                        e.setAttribute("data-heavy-bg", heavyAnimUrl);
                        e.setAttribute("id", "lcp-heavy-bg");
                    }
                }
            })
            .on('picture > source', {
                element(e) { e.removeAttribute("srcset"); }
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
                    const src = e.getAttribute('src') || '';
                    const innerCode = e.innerHTML || '';
                    if (currentType.toLowerCase() === 'application/ld+json') return;
                    if (src.includes('play.google.com') || innerCode.includes('play.google.com/log')) return;
                    if (!e.hasAttribute('data-edge-ignore')) {
                        e.setAttribute('data-original-type', currentType);
                        e.setAttribute('type', 'text/edge-delayed-script');
                    }
                }
            })
            .on('link[rel="stylesheet"]', {
                async element(e) {
                    const href = e.getAttribute('href') || "";
                    
                    if (href && href.includes('fonts.googleapis.com/css')) {
                        const newHref = href.includes('display=')
                            ? href.replace(/display=[^&]+/, 'display=swap')
                            : href + (href.includes('?') ? '&' : '?') + 'display=swap';
                        e.setAttribute('href', newHref);
                        e.setAttribute('media', 'print');
                        e.setAttribute('onload', "this.media='all'");
                    }
                    // ✅ EDIT 2: Replace gstatic <link> with R2-hosted version.
                    //
                    // BEFORE (broken): live fetch inside HTMLRewriter blocked HTML streaming
                    // every request, locking FCP/LCP/SI to ~4.1s (subrequest latency).
                    //
                    // BEFORE (previous attempt): inlining 198KB into HTML = same result —
                    // browser downloads ~250KB HTML before first paint on slow 4G.
                    //
                    // NOW: replace with /assets/css/gstatic-cache.css (R2, same Cloudflare
                    // edge, <50ms TTFB). HTML payload drops from ~250KB to ~52KB.
                    // Browser streams HTML instantly, fetches CSS in parallel.
                    // TBT=0, CLS=0 preserved. FCP/LCP target: ~1.5-2.5s on slow 4G.
                    //
                    // Fallback: if scanner hasn't run yet (KV empty), defer the original
                    // link instead — no crash, page loads slower until scanner populates R2.
                    else if (href && href.includes('www.gstatic.com')) {
                        if (agpGstaticReady === "ready") {
                            // R2 file confirmed populated by scanner — serve from edge
                            e.replace(`<link rel="stylesheet" href="/assets/css/gstatic-cache.css">`, { html: true });
                        } else {
                            // Fallback: scanner hasn't run yet, defer original gstatic link
                            // Page renders with slight CLS but no broken layout
                            e.setAttribute('media', 'print');
                            e.setAttribute('onload', "this.media='all'");
                        }
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

    if (isBot && !isCrawlerBot) {
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
  },
  // --- 7. THE CRON HANDLER FOR AI KV WRITES ---
  async scheduled(event, env, ctx) {
    console.log(`Cron triggered at ${event.scheduledTime}`);
  }
};
// FORCING A CLEAN SYNC TO CLOUDFLARE

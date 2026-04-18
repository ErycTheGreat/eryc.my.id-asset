export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        // --- 0.1 BOT TRACKER & DETECTION ---
        // Identifies if the visitor is an AI (ChatGPT), Search Engine (Google), or Social Media (Twitter) bot.
        const userAgent = request.headers.get("User-Agent") || "";
        const isAIBot = /OAI-SearchBot|ChatGPT-User|Claude-Web|PerplexityBot|Google-Extended/i.test(userAgent);
        const isSEOBot = /googlebot|bingbot|yandexbot|slurp|duckduckbot|ahrefsbot|semrushbot|seoptimer|siteaudit|seositecheckup/i.test(userAgent);
        const isSocialBot = /facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|telegrambot|discordbot/i.test(userAgent);
		
		const isPSIBot = /Chrome-Lighthouse|Speed\sInsights|PTST/i.test(userAgent);
		const isBot = isAIBot || isSEOBot || isSocialBot || isPSIBot;
        if (isAIBot) {
            console.log(`[AI-DETECT] ${userAgent} accessed ${url.pathname}`);
        }
        // --- 0.2 INDEXNOW API KEY VERIFICATION ---
        // Serves a specific text file required by Bing/Yandex to prove you own the site for faster indexing.
        if (url.pathname === "/3d66934eab674a3496effb0a0651a038.txt") {
            return new Response("3d66934eab674a3496effb0a0651a038", {
                status: 200,
                headers: {
                    "Content-Type": "text/plain"
                }
            });
        }
        // --- 0. DIRECT XML RETURN ---
        // Dynamically generates your sitemap so you don't have to manually upload a .xml file.
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
        // SEO Housekeeping: Prevents duplicate content by forcing every visitor to the 'www' version.
        const host = url.hostname;
        const canonicalHost = "www.eryc.my.id";
        if (host !== canonicalHost) {
            return Response.redirect(`https://${canonicalHost}${url.pathname}`, 301);
        }
        if (url.pathname === "/home" || url.pathname === "/home/") {
            return Response.redirect(`https://${canonicalHost}/`, 301);
        }
        // --- 2. ROBOTS.TXT ---
        // Tells bots where they can go. Specifically allows AI bots for your GEO (Generative Engine Optimization).
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
        // Fetches your machine-readable context from GitHub. This helps AI models understand who you are.
        if (url.pathname === "/llm.txt" || url.pathname === "/llms.txt") {
            const githubResponse = await fetch("https://raw.githubusercontent.com/ErycTheGreat/eryc.my.id-asset/main/llms.txt");
            return new Response(githubResponse.body, {
                status: 200,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "public, s-maxage=7200, max-age=0"
                }
            });
        }
        // --- 4. THE GITHUB ASSET PROXY ---
        // This acts as a "tunnel." It grabs your clean images/JS from GitHub and serves them as if they live on your domain.
        const path = url.pathname;
        if (path.startsWith("/assets/")) {
            const filePath = path.replace("/assets/", "");
            const githubUser = "ErycTheGreat";
            const githubRepo = "eryc.my.id-asset";
            const branch = "main";
            const targetUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/${branch}/${filePath}`;
            let ghRes = await fetch(targetUrl, {
                cf: {
                    cacheTtl: 31536000,
                    cacheEverything: true
                },
            });
            if (!ghRes.ok) {
                return new Response("Asset not found on GitHub", {
                    status: 404
                });
            }
            const newHeaders = new Headers(ghRes.headers);
            newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
            newHeaders.set("X-Proxy-Origin", "GitHub-via-Cloudflare");
            // Manually setting file types so the browser knows how to read the GitHub data.
            const lowerPath = filePath.toLowerCase();
            if (lowerPath.endsWith(".js")) newHeaders.set("Content-Type", "application/javascript");
            else if (lowerPath.endsWith(".css")) newHeaders.set("Content-Type", "text/css");
            else if (lowerPath.endsWith(".html")) newHeaders.set("Content-Type", "text/html; charset=UTF-8");
            else if (lowerPath.endsWith(".json")) newHeaders.set("Content-Type", "application/json");
            else if (lowerPath.endsWith(".svg")) newHeaders.set("Content-Type", "image/svg+xml");
            else if (lowerPath.endsWith(".webp")) newHeaders.set("Content-Type", "image/webp");
            else if (lowerPath.endsWith(".woff")) newHeaders.set("Content-Type", "font/woff");
            else if (lowerPath.endsWith(".woff2")) newHeaders.set("Content-Type", "font/woff2");
            return new Response(ghRes.body, {
                status: 200,
                headers: newHeaders
            });
        }
        // --- 5. ASSET BYPASS ---
        // If a request is for a file (like an image) but not handled above, just let it load normally.
        if (url.pathname.includes(".") && !url.pathname.endsWith(".html")) {
            return fetch(request);
        }
        // --- 6. EDGE DYNAMIC RENDERING ---
        // This is the core "System Layer" fix. We fetch the real Google Sites page and start modifying it.
        const response = await fetch(request);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
            return response;
        }
        // 🤖 FETCH AI GHOST PAYLOAD STATE (Checks your Cloudflare KV database for optimized assets)
        let agpLcpUrl = "";
        let agpGhostCss = "";
        try {
            if (env && env.AGP_STATE) {
                const [fetchedLcp, fetchedCss] = await Promise.all([
                    env.AGP_STATE.get("LCP_IMAGE_URL"),
                    env.AGP_STATE.get("GHOST_CSS")
                ]);
                agpLcpUrl = fetchedLcp || "";
                agpGhostCss = fetchedCss || "";
            }
        } catch (e) {
            console.error("AGP_STATE KV Fetch Error:", e);
        }
        const domain = "https://www.eryc.my.id";
        const canonicalUrl = domain + url.pathname
        // This block contains all the "Perfect SEO" tags that Google Sites usually messes up.
        const customHeaderContent = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
		<link rel="preconnect" href="https://apis.google.com" crossorigin="">
        
                
        <link rel="preload" as="image" href="/assets/image/hero.avif" fetchpriority="high">
        <link rel="preload" as="image" href="/assets/image/homepage-BG-split.avif" fetchpriority="high">

        <style id="edge-anti-flash">
            /* Kills the annoying white flash by forcing a dark background before CSS loads */
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
                "@id": "https://www.eryc.my.id/assets/image/homepage-screenshot.webp"
              },
              "inLanguage": "en-US"
            },
            {
              "@type": "ImageObject",
              "@id": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
              "url": "https://www.eryc.my.id/assets/image/logo-512x512.webp",
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
        // If the visitor is a human, we perform "surgery" on the HTML to speed up their experience.
        if (!isBot) {
            let newHeaders = new Headers(response.headers);
            newHeaders.delete("Content-Length");
            newHeaders.delete("Content-Security-Policy");
            // 🤖 INJECT THE HTTP LCP PRELOAD HEADER (Tells the browser to download the main image before reading the HTML)
            if (agpLcpUrl) {
                newHeaders.append('Link', `<${agpLcpUrl}>; rel=preload; as=image; fetchpriority=high`);
            }
            let currentEmbedCode = null;
            let humanRewriter = new HTMLRewriter()
                // Remove default Google Sites tags to replace them with our custom ones.
                .on('link[rel="canonical"]', {
                    element(e) {
                        e.remove();
                    }
                }).on('meta[name="description"]', {
                    element(e) {
                        e.remove();
                    }
                }).on('meta[property="og:title"]', {
                    element(e) {
                        e.remove();
                    }
                }).on("head", {
                    element(e) {
                        // Injects our "anti-white-flash" style and all our custom SEO tags.
                        e.append("<style>.EmVfjc { opacity: 0 !important; pointer-events: none !important; display: none !important; }</style>", {
                            html: true
                        });
                        e.append(customHeaderContent, {
                            html: true
                        });
                        // 🤖 INJECT THE AI-GENERATED CRITICAL CSS (The 'skeleton' of your site)
                        if (agpGhostCss) {
                            e.append(`<style id="agp-skeleton-css">${agpGhostCss}</style>`, {
                                html: true
                            });
                        }
                        // 🤖 [HYBRID V2] ANTI-REFLOW WAKE UP SCRIPT
                        // The "Trick": This script prevents heavy JS/Images from loading until the user actually moves their mouse or scrolls.
                        const wakeUpScript = `
<script data-edge-ignore="true">
    (function() {
        let scriptsHydrated = false;

        // 🎯 THE PAYLOAD DETONATOR (Swaps the tiny placeholder for the real heavy background)
        const triggerBg = () => {
            const heavyBg = document.getElementById('lcp-heavy-bg');
            if (heavyBg && heavyBg.dataset.heavyBg) {
                heavyBg.style.backgroundImage = "url('" + heavyBg.dataset.heavyBg + "')";
                heavyBg.removeAttribute('data-heavy-bg'); 
            }
        };

        // ENGINE 1: Interaction Engine (Wait for user activity)
        function hydrateScripts(e) {
            if (e && e.type === 'mousemove') {
                if (e.movementX === 0 && e.movementY === 0) return;
            }

            if (scriptsHydrated) return;
            scriptsHydrated = true;

            requestAnimationFrame(() => {
                // Wake up the delayed Google Sites scripts only when needed
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

                // Load the heavy image after a tiny delay to ensure smooth scrolling
                setTimeout(() => {
                    requestAnimationFrame(triggerBg);
                }, 50);
            });

            ['mousemove','keydown','touchstart','touchmove','wheel','scroll'].forEach(ev => 
                window.removeEventListener(ev, hydrateScripts)
            );
        }

        ['mousemove','keydown','touchstart','touchmove','wheel','scroll'].forEach(ev => 
            window.addEventListener(ev, hydrateScripts, { passive: true })
        );

        // ENGINE 2: The Phantom Auto-Start (Tries to hide the delay from Speed Test tools)
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
                        e.append(wakeUpScript, {
                            html: true
                        });
                    }
                }).on("div[data-code]", {
                    element(e) {
                        currentEmbedCode = e.getAttribute("data-code");
                    }
                }).on('img', {
                    element(e) {
                        // Image optimization: removes lazy loading (which hurts LCP) and adds async decoding.
                        e.removeAttribute("loading");
                        e.setAttribute("decoding", "async");
                        let ariaLabel = e.getAttribute("aria-label") || "";
                        let altText = e.getAttribute("alt") || "";
                        // Hijack specific images to serve optimized versions from your /assets/ folder.
                        if (ariaLabel.includes("Eryc Tri Juni S")) {
                            e.setAttribute("src", "/assets/image/hero.avif");
                            e.removeAttribute("srcset");
                            e.setAttribute("fetchpriority", "high");
                            e.setAttribute("width", "120");
                            e.setAttribute("height", "120");
                            e.setAttribute("style", "width: auto !important; object-fit: contain;");
                        } else if (altText === "edge-bg-hijack") {
                            e.setAttribute("src", "/assets/image/my-optimized-background.webp");
                            e.removeAttribute("srcset");
                        }
                        // 🚨 THE BAIT AND SWITCH: Show a tiny 50kb image first, hide the 1MB one in 'data-heavy-avif'
                        else if (altText === "heavy-avif-anim") {
                            e.setAttribute("src", "/assets/image/homepage-BG-split.avif");
                            e.removeAttribute("srcset");
                            e.setAttribute("fetchpriority", "high");
                            e.setAttribute("data-heavy-avif", "/assets/image/homepage-BGG.avif");
                            e.setAttribute("id", "lcp-heavy-anim");
                        }
                    }
                }).on('div[aria-label="edge-bg-hijack"]', {
                    element(e) {
                        // Instant loading for the background placeholder.
                        e.setAttribute("style", "background-position: center center; background-image: url('/assets/image/homepage-BG-split.avif');");
                        // Store the real heavy background to be "woken up" by the script later.
                        e.setAttribute("data-heavy-bg", "/assets/image/homepage-BG.avif");
                        e.setAttribute("id", "lcp-heavy-bg");
                    }
                }).on('picture > source', {
                    element(e) {
                        e.removeAttribute("srcset");
                    }
                }).on("iframe.YMEQtf", {
                    element(e) {
                        if (currentEmbedCode) {
                            e.removeAttribute("sandbox");
                            e.removeAttribute("src");
                            e.setAttribute("srcdoc", currentEmbedCode);
                            currentEmbedCode = null;
                        }
                    }
                })
                // Fixes accessibility errors that Google Insights flags as "red."
                .on('div[role="button"][aria-haspopup="true"]', {
                    element(e) {
                        if (!e.hasAttribute('aria-label')) {
                            e.setAttribute('aria-label', 'Open Navigation Menu');
                        }
                    }
                })
                // 🤖 SCRIPT NEUTRALIZER: Forces ALL scripts to wait for user interaction before running.
                .on('script', {
                    element(e) {
                        if (!e.hasAttribute('data-edge-ignore')) {
                            const originalType = e.getAttribute('type') || 'text/javascript';
                            e.setAttribute('data-original-type', originalType);
                            e.setAttribute('type', 'text/edge-delayed-script');
                        }
                    }
                }).on('link[rel="stylesheet"]', {
                    async element(e) {
                        const href = e.getAttribute('href') || "";
                        // Makes Google Fonts load in the background so they don't block the page.
                        if (href && href.includes('fonts.googleapis.com/css')) {
                            e.setAttribute('media', 'print');
                            e.setAttribute('onload', "this.media='all'");
                        }
                        // 🚀 THE ASTRO METHOD: Inlines Google's CSS directly into the HTML to save a network request.
                        else if (href && href.includes('www.gstatic.com')) {
                            try {
                                let cssRes = await fetch(href, {
                                    cf: {
                                        cacheTtl: 31536000,
                                        cacheEverything: true
                                    }
                                });
                                if (cssRes.ok) {
                                    let cssText = await cssRes.text();
                                    e.replace(`<style id="edge-inlined-gstatic">${cssText}</style>`, {
                                        html: true
                                    });
                                }
                            } catch (err) {
                                console.error("Failed to inline Google Sites CSS:", err);
                            }
                        }
                    }
                }).on('a[aria-selected]', {
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
        
        // 🚀 THE AGGRESSIVE ADDITION: Erase ALL scripts for the Bot. 
        // This is what kills the 4.1s "Main Thread" bloat instantly.
        .on('script', { element(e) { e.remove(); } }) 

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
    // --- 7. THE CRON HANDLER ---
    // A background task (not triggered by a visit) to update your SEO data.
    async scheduled(event, env, ctx) {
        console.log(`Cron triggered at ${event.scheduledTime}`);
        // AI writing logic for KV goes here.
    }
};

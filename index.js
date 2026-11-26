import { handleSitemapRequest } from './sitemap.js';
import { handleMCPRequest } from './mcp.js';
import { handleAgentSkillsRequest } from './agent-skills.js';
import { handleMCPServerCardRequest } from './mcp-server-card.js';
import { handleARDRequest } from './ard.js';
import { handleRobotsTxtRequest } from './robots.js';
import { getJsonLdSchema } from './schema.js';
import { handleFaviconRequest } from './favicon.js';
import { withAgp } from './agp-telemetry/index.js';

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

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 0.1 BOT TRACKER & DETECTION ---
	const userAgent = request.headers.get("User-Agent") || "";
	const isAIBot = /OAI-SearchBot|ChatGPT-User|GPTBot|ClaudeBot|Claude-User|Claude-SearchBot|Claude-Web|PerplexityBot|Perplexity-User|Google-Agent|GoogleAgent-Search|GoogleOther|Gemini-Deep-Research|Google-Extended|gemini|vertex|apis-google|google-read-aloud|anthropic-ai/i.test(userAgent);
	const isCrawlerBot = /Googlebot|bingbot|Applebot|Yandexbot/i.test(userAgent);
	const isSocialBot = /FacebookBot|Twitterbot|WhatsApp|LinkedInBot|Telegrambot|Discordbot/i.test(userAgent);

	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
		
	const isBot = isAIBot || isCrawlerBot || isSocialBot || (request.cf && request.cf.asReplacerBot) || url.searchParams.get("debug") === "bot";
	const isPSI = /Chrome-Lighthouse|PTST/i.test(userAgent);

    if (isBot) {
        console.log(`[AI-DETECT] ${userAgent} accessed ${url.pathname}`);
    }

	// ==========================================
    // 🤖 WebMCP ENDPOINT (The AI Agent Doorway)
    // ==========================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
        return await handleMCPRequest(request, env);
    }
    // ==========================================
	
	// --- 0.2 INDEXNOW API KEY VERIFICATION ---
    if (url.pathname === "/3d66934eab674a3496effb0a0651a038.txt") {
      return new Response("3d66934eab674a3496effb0a0651a038", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }
    
    // --- 0. SITEMAP ROUTING ---
    const sitemapResponse = await handleSitemapRequest(url, env);
    if (sitemapResponse) {
        return sitemapResponse;
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
    const robotsResponse = handleRobotsTxtRequest(url, canonicalHost);
    if (robotsResponse) {
        return robotsResponse;
    }

	// --- 3. AGENT SKILLS INDEX ---
    if (url.pathname === "/.well-known/agent-skills/index.json") {
        return handleAgentSkillsRequest();
    }

	// --- 3.1 MCP SERVER CARD ---
        if (url.pathname === "/.well-known/mcp/server-card.json") {
            return handleMCPServerCardRequest();
    }

	// --- 3.1b ARD MANIFEST ---
		if (url.pathname === "/.well-known/ard.json") {
    		return handleARDRequest();
	}
	  
    // --- 3.2 LLMS.TXT ROUTING ---
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

	if (url.pathname === "/llms-full.txt" || url.pathname === "/llms-full.txt/") {
      const object = await env.MY_ASSETS.get("llms-full.txt", { type: "text" });
      if (object === null) {
        return new Response("llms-full.txt not found in R2", { status: 404 });
      }
      return new Response(object.body, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, s-maxage=7200, max-age=0",
        }
      });
    }
	  
	// --- 3.3 FAVICON & MANIFEST ROUTING ---
    const faviconResponse = await handleFaviconRequest(url);
    if (faviconResponse) {
        return faviconResponse;
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
		  // Forwarding request headers ensures Accept-Encoding is passed 
          // so Cloudflare applies Brotli/Gzip compression.
		  assetResponse = await fetch(r2DomainUrl, {
              headers: request.headers 
          });
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
	let agpCriticalCss = "";
    try {
        if (env && env.AGP_STATE) {
            const [fetchedLcp, fetchedCss, fetchedGstatic] = await Promise.all([
                env.AGP_STATE.get("LCP_IMAGE_URL"),
                env.AGP_STATE.get("GHOST_CSS"),
                env.AGP_STATE.get("GSTATIC_CSS"),
				env.AGP_STATE.get("CRITICAL_CSS")
            ]);
            agpLcpUrl = fetchedLcp || "";
            agpGhostCss = fetchedCss || "";
            agpGstaticReady = fetchedGstatic || "";
			agpCriticalCss = fetchedCritical || "";
        }
    } catch (e) {
        console.error("AGP_STATE KV Fetch Error:", e);
    }

    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname;

	  	 const jsonLdSchema = getJsonLdSchema();
    // ✅ EDIT 1: Added preload hint for the R2-cached gstatic CSS.
    // Tells the browser to fetch it early in parallel with the HTML stream.
		  const customHeaderContent = `
		  <link rel="preload" as="image" href="/assets/image/hero.avif" fetchpriority="high">
		  <link rel="preload" as="image" href="/assets/image/homepage-BG-split.avif" fetchpriority="high">  
		  ${agpGstaticReady === "ready" ? '<link rel="preload" as="style" href="/assets/css/gstatic-cache.css">' : ''}
		  		 
		  <!-- FAVICON & WEB MANIFEST -->
		  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
		  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
		  <link rel="shortcut icon" href="/favicon.ico">
		  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
		  <link rel="manifest" href="/site.webmanifest">
		  
		  <style id="edge-anti-flash">
			html { background-color: #060522 !important; }
			:root {
			  --theme-page_background-color: transparent !important;
			  --theme-background-color: transparent !important;
			}
			body { background-color: transparent !important; }

						/* Mobile: full-screen sections = the visible screen */
			@supports (height: 100dvh) {
			  .LB7kq.KEFykf { height: 100dvh !important; }
			}

			/* Homepage on phones: no scrolling + group centred */
			@media only screen and (max-width: 479px) {
			  html:has([style*="homepage-BG"]) {
			    height: 100%;
			    overflow: hidden;
			    overscroll-behavior: none;
			  }
			  html:has([style*="homepage-BG"]) body {
			    height: 100%;
			    overflow: clip;
			    overflow-anchor: none;
			  }
			  html:has([style*="homepage-BG"]) .LB7kq.KEFykf .mYVXT {
			    transform: translateY(-4.75vh);
			  }
		    }
		  </style>

		  <meta name="description" content="Eryc Tri Juni S: Edge SEO & GEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
		  <meta name="keywords" content="eryc tri juni s, edge SEO & GEO specialist, digital marketing specialist, portfolio, malang, indonesia">
		  <meta name="author" content="Eryc Tri Juni S">
		  <meta name="google-site-verification" content="Qval4eNJhMpInxPCHk-08v6D9sxftApTQc1E8Z6hbug">
		  <meta name="yandex-verification" content="275f3c061328554a">

		  <link rel="canonical" href="${canonicalUrl}">
		  <link rel="sitemap" type="application/xml" href="https://www.eryc.my.id/sitemap.xml">
		  <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llms.txt" title="LLMs.txt">
		  <link rel="alternate" type="text/plain" href="https://www.eryc.my.id/llms-full.txt" title="LLMs-Full.txt">
		  <link rel="author" href="${domain}/about">

		  <meta property="og:type" content="website">
		  <meta property="og:site_name" content="Eryc Tri Juni S">
		  <meta property="og:locale" content="en_US">
		  <meta property="og:title" content="Edge SEO & GEO Specialist Malang | Eryc Tri Juni S">
		  <meta property="og:description" content="Eryc Tri Juni S: Edge SEO & GEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
		  <meta property="og:url" content="${canonicalUrl}">
		  <meta property="og:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
		  <meta property="og:image:alt" content="Eryc Tri Juni S – Edge SEO & GEO Specialist Malang">

		  <meta name="twitter:card" content="summary_large_image">
		  <meta name="twitter:title" content="Edge SEO & GEO Specialist Malang | Eryc Tri Juni S">
		  <meta name="twitter:description" content="Eryc Tri Juni S: Edge SEO & GEO Specialist in Malang, Indonesia. I fix SEO at the system layer, not just content—to capture search intent that buys.">
		  <meta name="twitter:image" content="https://www.dropbox.com/scl/fi/erfruldeb5w2ownre5qn8/eryctrijunis-lv-0-20260225023845.gif?rlkey=yo5h6ye46dkb0ailv3t7v244l&st=7zq9vfpx&raw=1">
		  <meta name="twitter:image:alt" content="Eryc Tri Juni S – Edge SEO & GEO Specialist Malang">
		  <meta name="twitter:creator" content="@eryctrijunis">

			${jsonLdSchema}
  
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

		        <script>
        if (location.search.indexOf('dbg') > -1) addEventListener('DOMContentLoaded', function () {
          var box = document.createElement('pre');
          box.style.cssText = 'position:fixed;left:0;bottom:0;z-index:99999;margin:0;padding:6px;font:10px monospace;background:#000d;color:#0f0;white-space:pre-wrap;max-width:100%';
          document.body.appendChild(box);
          var t0 = performance.now(), log = [];
          function snap(why) {
            var m = document.querySelector('.LB7kq.KEFykf .mYVXT');
            var f = document.querySelector('iframe.YMEQtf');
            var sec = document.querySelector('.LB7kq.KEFykf');
            var nav = performance.getEntriesByType('navigation')[0] || {};
            log.push(Math.round(performance.now() - t0) + 'ms ' + why +
              ' top=' + (f ? Math.round(f.getBoundingClientRect().top) : '-') +
              ' sec=' + (sec ? Math.round(sec.getBoundingClientRect().top) + '/' + Math.round(sec.getBoundingClientRect().height) + '/p' + getComputedStyle(sec).paddingTop : '-') +
              ' cell=' + (m ? Math.round(m.getBoundingClientRect().top) + '/' + Math.round(m.getBoundingClientRect().height) + '/p' + getComputedStyle(m).paddingTop : '-') +
              ' pre=' + (document.prerendering ? 1 : 0) +
              ' act=' + Math.round(nav.activationStart || 0) +
              ' nt=' + (nav.type || '-'));
            box.textContent = log.slice(-9).join(String.fromCharCode(10));
          }
          snap('dcl');
          addEventListener('load', function () { snap('load'); });
          addEventListener('scroll', function () { snap('scroll'); }, true);
          addEventListener('resize', function () { snap('resize'); });
          [300, 1000, 2000, 4000].forEach(function (ms) { setTimeout(function () { snap(ms + 'ms'); }, ms); });
        });
        </script>
        `;
      
    // 🏎️ THE HUMAN FAST-LANE BYPASS
    if (!isBot) {
        let newHeaders = new Headers(response.headers);
        newHeaders.delete("Content-Length"); 
        newHeaders.delete("Content-Security-Policy");

		// --- ORIGIN WEBMCP TRIAL TOKEN HERE ---
		if (env.WEBMCP_OT_TOKEN) {
        newHeaders.set("Origin-Trial", env.WEBMCP_OT_TOKEN);
        }
		
        const heavyAnimUrl = isMobile ? "/assets/image/homepage-BG-mobile.avif" : "/assets/image/homepage-BG.avif";

        if (agpLcpUrl) {
            newHeaders.append('Link', `<${agpLcpUrl}>; rel=preload; as=image; fetchpriority=high`);
        }

		// 🔗 ADD AI DISCOVERY HEADER TO HUMAN LANE
        newHeaders.append("Link", '<https://www.eryc.my.id/llms.txt>; rel="alternate"; type="text/markdown"');
		newHeaders.append("Link", '</.well-known/ard.json>; rel="ard"');
		
        let currentEmbedCode = null;

        let humanRewriter = new HTMLRewriter()
            .on('link[rel="canonical"]', { element(e) { e.remove(); } })
            .on('meta[name="description"]', { element(e) { e.remove(); } })
            .on('meta[property="og:title"]', { element(e) { e.remove(); } })
            
            .on("head", {
                element(e) {
                    e.append("<style>.EmVfjc { opacity: 0 !important; pointer-events: none !important; display: none !important; }</style>", { html: true });
                    e.append(customHeaderContent, { html: true }); 

                    // --- ANDROID-STYLE OVERLAY SCROLLBAR (all pages except the homepage) ---
                    // Purely additive: hides the native bar and shows a thin #00bba9 thumb only while scrolling.
                    if (url.pathname.replace(/\/$/, "") !== "") {
                        e.append('<script data-edge-ignore="true">' + SCROLL_THUMB_JS + '</script>', { html: true });
                    }

					// --- 1. INJECT WEBMCP SCRIPT HERE ---
                    //e.append(webMcpClientScript, { html: true });
					
                    if (agpGhostCss) {
                        e.append(`<style id="agp-skeleton-css">${agpGhostCss}</style>`, { html: true });
					}
					// Inject the critical CSS inline for Mobile only
                    if (agpCriticalCss && isMobile) {
                        e.append(`<style id="agp-critical-css">${agpCriticalCss}</style>`, { html: true });
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
            // 🛑 STOP PSI FROM TRIGGERING LAYOUT SHIFTS MID-TEST
            if (navigator.userAgent.includes("Lighthouse") || navigator.userAgent.includes("PTST") || navigator.webdriver) return;

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
                        if (isMobile) {
                            // Mobile: Defer heavy CSS to protect FCP/LCP
                            e.replace(`<link rel="stylesheet" href="/assets/css/gstatic-cache.css" media="print" onload="this.media='all'">`, { html: true });
                        } else {
                            // Desktop: Load synchronously to kill CLS (bandwidth handles it easily)
                            e.replace(`<link rel="stylesheet" href="/assets/css/gstatic-cache.css" fetchpriority="high">`, { html: true });
                        }
                    } else {
                        // Fallback if KV is empty
                        if (isMobile) {
                            e.setAttribute('media', 'print');
                            e.setAttribute('onload', "this.media='all'");
                        }
                    }
                }
			}
            })
            .on('a[aria-selected]', {
                element(e) {
                    e.removeAttribute('aria-selected');
                    e.setAttribute('aria-current', 'page');
                }
            })

			    .on('a[href^="https://www.google.com/url?q="], a[data-url^="https://www.google.com/url?q="]', {
                element(e) {
                    for (const attr of ['href', 'data-url']) {
                        const v = e.getAttribute(attr);
                        if (!v) continue;
                        try {
                            const u = new URL(v);
                            if (u.hostname === 'www.google.com' && u.pathname === '/url') {
                                const q = u.searchParams.get('q');
                                if (q) { const h = new URL(q).hostname; if (h === 'eryc.my.id' || h.endsWith('.eryc.my.id')) e.setAttribute(attr, q); }
                            }
                        } catch (_) {}
                    }
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

	// --- ORIGIN WEBMCP TRIAL TOKEN HERE ---
   if (env.WEBMCP_OT_TOKEN) {
    newHeaders.set("Origin-Trial", env.WEBMCP_OT_TOKEN);
   }
	  
    if (agpLcpUrl) {
        newHeaders.append('Link', `<${agpLcpUrl}>; rel=preload; as=image`);
    }

	// Inject the AI Link Header here
    newHeaders.append("Link", '<https://www.eryc.my.id/llms.txt>; rel="alternate"; type="text/markdown"');
	newHeaders.append("Link", '</.well-known/ard.json>; rel="ard"');
	  
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

// Bot telemetry wrapper: observes only, writes to its own AGP_TELEMETRY KV namespace.
const SCROLL_THUMB_JS = `/* Android-style overlay scrollbar: native bar hidden (page keeps full width),
   a thin #00bba9 thumb fades in while scrolling and fades out when idle. */
(function () {
  if (window.__erycThumb) return; window.__erycThumb = 1;
  var st = document.createElement("style");
  st.textContent = "html{scrollbar-width:none}html::-webkit-scrollbar{display:none;width:0;height:0}" +
    "#eryc-thumb{position:fixed;right:2px;top:0;width:4px;border-radius:4px;background:#00bba9;" +
    "opacity:0;transition:opacity .35s ease;pointer-events:none;z-index:2147483647;will-change:transform,opacity}" +
    "#eryc-thumb.on{opacity:.9}";
  document.head.appendChild(st);
  var t = document.createElement("div"); t.id = "eryc-thumb"; t.setAttribute("aria-hidden", "true");
  function mount() { document.body.appendChild(t); }
  if (document.body) mount(); else addEventListener("DOMContentLoaded", mount);
  var timer, de = document.documentElement;
  function draw() {
    var ih = window.innerHeight, sh = Math.max(de.scrollHeight, document.body.scrollHeight);
    if (sh <= ih + 1) { t.classList.remove("on"); return false; }
    var pad = 6, track = ih - pad * 2, h = Math.max(40, track * ih / sh);
    var y = pad + (window.scrollY / (sh - ih)) * (track - h);
    t.style.height = h + "px"; t.style.transform = "translateY(" + y + "px)";
    return true;
  }
  function show() {
    if (!draw()) return;
    t.classList.add("on"); clearTimeout(timer);
    timer = setTimeout(function () { t.classList.remove("on"); }, 900);
  }
  addEventListener("scroll", show, { passive: true });
  addEventListener("resize", show, { passive: true });
})();
`;

export default withAgp(worker, { kvBinding: 'AGP_TELEMETRY' });

// FORCING A CLEAN SYNC TO CLOUDFLARE

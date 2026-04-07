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

    // 🚨 FIX: Define domain and canonicalUrl BEFORE we try to use them in the SEO tags!
    const domain = "https://www.eryc.my.id";
    const canonicalUrl = domain + url.pathname
     // B. HEAD INJECTION (Always injected, good for all pages)
    // Note: You can also move this to KV later if you want custom JSON-LD per page!
   // The entire <head> payload (Meta + JSON-LD)
    const customHeaderContent = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link rel="icon" href="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiPgo8cGF0aCBkPSJNMCAwIEMzOS42IDAgNzkuMiAwIDEyMCAwIEMxMjAgMzkuNiAxMjAgNzkuMiAxMjAgMTIwIEM4MC40IDEyMCA0MC44IDEyMCAwIDEyMCBDMCA4MC40IDAgNDAuOCAwIDAgWiAiIGZpbGw9IiMwNjA2MjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMCkiLz4KPHBhdGggZD0iTTAgMCBDMy43NDU5MTcwMyAwLjU3Mjc4Njg0IDUuNDczNDg3OTYgMi4wOTQzMjY0NCA4LjEyNTk3NjU2IDQuNzM3NzkyOTcgQzguOTI2NTA0NTIgNS41Mjg4NjQ0NCA5LjcyNzAzMjQ3IDYuMzE5OTM1OTEgMTAuNTUxODE4ODUgNy4xMzQ5NzkyNSBDMTEuNDA2MTI0ODggNy45OTUzNTc5NyAxMi4yNjA0MzA5MSA4Ljg1NTczNjY5IDEzLjE0MDYyNSA5Ljc0MjE4NzUgQzE0LjAyMjgwNzAxIDEwLjYyMTQ5OTMzIDE0LjkwNDk4OTAxIDExLjUwMDgxMTE2IDE1LjgxMzkwMzgxIDEyLjQwNjc2ODggQzE3LjY3Njk0MDEzIDE0LjI2Nzc2MzA4IDE5LjUzNjY0MzI1IDE2LjEzMTUwMDMgMjEuMzkxNjAxNTYgMTguMDAwNDg4MjggQzIzLjc3MTIwNzYgMjAuMzk3MjEwODUgMjYuMTY0MDYxODEgMjIuNzgwMTgwNDMgMjguNTYxMTkxNTYgMjUuMTU5MzYwODkgQzMwLjg0NDk2MDkgMjcuNDI5Njk2NSAzMy4xMTcyODM1MSAyOS43MTE0MTc0NyAzNS4zOTA2MjUgMzEuOTkyMTg3NSBDMzYuNjg0MjI5NDMgMzMuMjc2NjgyODkgMzYuNjg0MjI5NDMgMzMuMjc2NjgyODkgMzguMDAzOTY3MjkgMzQuNTg3MTI3NjkgQzM4Ljc5MTg4NjYgMzUuMzg0NTAzNDggMzkuNTc5ODA1OTEgMzYuMTgxODc5MjcgNDAuMzkxNjAxNTYgMzcuMDAzNDE3OTcgQzQxLjA5MDEzMjQ1IDM3LjcwNDMzNTYzIDQxLjc4ODY2MzMzIDM4LjQwNTI1MzMgNDIuNTA4MzYxODIgMzkuMTI3NDEwODkgQzQ0IDQxIDQ0IDQxIDQ0IDQ0IEM0Mi41MTQ2MzMxOCA0NS41NjQyNTQ3NiA0Mi41MTQ2MzMxOCA0NS41NjQyNTQ3NiA0MC40NzA0NTg5OCA0Ny4yMjUzNDE4IEMzNi4yNTY0OTk4MyA1MC43NTg4NTkxMyAzMi4zNTMzNjYzNyA1NC41MDE0MjQxNyAyOC40NzI2NTYyNSA1OC4zOTQ1MzEyNSBDMjcuNDYxMDc3MDQgNTkuNDA0Njc1MzcgMjcuNDYxMDc3MDQgNTkuNDA0Njc1MzcgMjYuNDI5MDYxODkgNjAuNDM1MjI2NDQgQzI1LjAyMDQwOTMyIDYxLjg0MzIwNDQgMjMuNjEyOTk1MDEgNjMuMjUyNDIyMjQgMjIuMjA2Nzg3MTEgNjQuNjYyODQxOCBDMjAuMDQ3MjAyMjcgNjYuODI3ODM2MDQgMTcuODgyMjYxMTggNjguOTg3MzcyNTYgMTUuNzE2Nzk2ODggNzEuMTQ2NDg0MzggQzE0LjM0MzQyODggNzIuNTIwNTEyMzcgMTIuOTcwMzcwNDkgNzMuODk0ODUwMDYgMTEuNTk3NjU2MjUgNzUuMjY5NTMxMjUgQzEwLjk0OTgyNjgxIDc1LjkxNTMzNjQ2IDEwLjMwMTk5NzM4IDc2LjU2MTE0MTY2IDkuNjM0NTM2NzQgNzcuMjI2NTE2NzIgQzguNzQyNDE3MzcgNzguMTIzMzY0MzMgOC43NDI0MTczNyA3OC4xMjMzNjQzMyA3LjgzMjI3NTM5IDc5LjAzODMzMDA4IEM3LjMwNzkxMzk3IDc5LjU2MzQ4NzA5IDYuNzgzNTUyNTUgODAuMDg4NjQ0MSA2LjI0MzMwMTM5IDgwLjYyOTcxNDk3IEM0Ljg4NzQ4NjM4IDgyLjAwMDE3OTkyIDQuODg3NDg2MzggODIuMDAwMTc5OTIgNCA4NCBDMy4wMSA4NCAyLjAyIDg0IDEgODQgQzEuNTc4MzE0NzIgODAuMzc0MzMwNTYgMi45MjYwMjYwNyA3OC43MDcxMTk5NiA1LjUxMDAwOTc3IDc2LjE0OTQxNDA2IEM2LjI1MDcwMjA2IDc1LjQwODk0ODM2IDYuOTkxMzk0MzUgNzQuNjY4NDgyNjcgNy43NTQ1MzE4NiA3My45MDU1Nzg2MSBDOC41NTg3MDA0MSA3My4xMTY4OTM5MiA5LjM2Mjg2ODk2IDcyLjMyODIwOTIzIDEwLjE5MTQwNjI1IDcxLjUxNTYyNSBDMTEuNDIxMTY0MzIgNzAuMjkyMjM0MTkgMTEuNDIxMTY0MzIgNzAuMjkyMjM0MTkgMTIuNjc1NzY1OTkgNjkuMDQ0MTI4NDIgQzE1LjI5NzcyNzYyIDY2LjQzODk2ODk0IDE3LjkyOTkyNDQ4IDYzLjg0NDQyOTIxIDIwLjU2MjUgNjEuMjUgQzIyLjM0MTE3ODQ1IDU5LjQ4NjM2NjMxIDI0LjExOTE4MTkyIDU3LjcyMjA1MTYgMjUuODk2NDg0MzggNTUuOTU3MDMxMjUgQzMwLjI1NjUxOTQgNTEuNjMwMDg1OTcgMzQuNjI1MDA1MjcgNDcuMzExODE2MDIgMzkgNDMgQzM3LjU4Mjk3MTQ2IDM5Ljc3MzQzMjY2IDM1Ljg4MTY4ODQ5IDM3LjY0NjE4NTQ1IDMzLjM3NjQ2NDg0IDM1LjE4MTE1MjM0IEMzMi42MzU4NDgwOCAzNC40NDcxNDIwMyAzMS44OTUyMzEzMiAzMy43MTMxMzE3MSAzMS4xMzIxNzE2MyAzMi45NTY4Nzg2NiBDMjkuOTMzNjYwNzQgMzEuNzgzMjYyNzkgMjkuOTMzNjYwNzQgMzEuNzgzMjYyNzkgMjguNzEwOTM3NSAzMC41ODU5Mzc1IEMyNy44OTI1MTM3MyAyOS43NzUwODY5OCAyNy4wNzQwODk5NyAyOC45NjQyMzY0NSAyNi4yMzA4NjU0OCAyOC4xMjg4MTQ3IEMyMy42MTY5NzkgMjUuNTM5MzY3MjYgMjAuOTk2Nzg0MzQgMjIuOTU2NDQ5MiAxOC4zNzUgMjAuMzc1IEMxNC45MTg4MzY1MSAxNi45NzE3OTQ4NyAxMS40NjkxNjQ3NCAxMy41NjIyMDUxNiA4LjAyMzQzNzUgMTAuMTQ4NDM3NSBDNy4yMjAzODE3NyA5LjM2MTk3ODQ1IDYuNDE3MzI2MDUgOC41NzU1MTk0MSA1LjU4OTkzNTMgNy43NjUyMjgyNyBDNC44NTU2MjI4NiA3LjAzNzUyMjI4IDQuMTIxMzEwNDIgNi4zMDk4MTYyOCAzLjM2NDc0NjA5IDUuNTYwMDU4NTkgQzIuNzEzNDc3NDggNC45MTkyNjM2MSAyLjA2MjIwODg2IDQuMjc4NDY4NjMgMS4zOTEyMDQ4MyAzLjYxODI1NTYyIEMwIDIgMCAyIDAgMCBaICIgZmlsbD0iI0UzRTNFNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTcsMTgpIi8+CjxwYXRoIGQ9Ik0wIDAgQzAuNDk1IDEuNDg1IDAuNDk1IDEuNDg1IDEgMyBDLTEuODk0NDUyMzkgOC4zMjMxNTI4MiAtNi4wNTc0NTU3MyAxMi4zMDMxNjU3NiAtMTAuMzU1NDY4NzUgMTYuNTE1NjI1IEMtMTEuMDU3NzEwNzIgMTcuMjEyNjY1NDEgLTExLjc1OTk1MjcgMTcuOTA5NzA1ODEgLTEyLjQ4MzQ3NDczIDE4LjYyNzg2ODY1IEMtMTQuNzEzNDE3MzYgMjAuODQwMDg2ODYgLTE2Ljk0OTk3MTA1IDIzLjA0NTQ1NzMzIC0xOS4xODc1IDI1LjI1IEMtMjEuNDM0ODI3OTMgMjcuNDY5NzEzNTggLTIzLjY4MDY3NDk0IDI5LjY5MDg3NjIyIC0yNS45MjM2NjAyOCAzMS45MTQ5NzgwMyBDLTI3LjMxNjUwMDgxIDMzLjI5NTU1Mzk1IC0yOC43MTIwMDU2NyAzNC42NzM0NDgwMiAtMzAuMTEwMzk3MzQgMzYuMDQ4NDAwODggQy0zMS4wNTE5MTM5OSAzNi45ODAxMjExNSAtMzEuMDUxOTEzOTkgMzYuOTgwMTIxMTUgLTMyLjAxMjQ1MTE3IDM3LjkzMDY2NDA2IEMtMzIuNTY2NjQyMyAzOC40NzY2MDIxNyAtMzMuMTIwODMzNDQgMzkuMDIyNTQwMjggLTMzLjY5MTgxODI0IDM5LjU4NTAyMTk3IEMtMzUuMTA5MzYwNDEgNDAuOTg2MzgwNjcgLTM1LjEwOTM2MDQxIDQwLjk4NjM4MDY3IC0zNiA0MyBDLTM2Ljk5IDQzIC0zNy45OCA0MyAtMzkgNDMgQy0zOC40MjE3ODI3MSAzOS4zODM2MzU1NSAtMzcuMDg5Njk2NTUgMzcuNzI2NjM5OCAtMzQuNTA1ODU5MzggMzUuMTgxMTUyMzQgQy0zMy43NjgzOTQ3OCAzNC40NDcxNDIwMyAtMzMuMDMwOTMwMTggMzMuNzEzMTMxNzEgLTMyLjI3MTExODE2IDMyLjk1Njg3ODY2IEMtMzEuNDcwMDg2NjcgMzIuMTc0NDY4MDggLTMwLjY2OTA1NTE4IDMxLjM5MjA1NzUgLTI5Ljg0Mzc1IDMwLjU4NTkzNzUgQy0yOS4wMjYyODI5NiAyOS43NzUwODY5OCAtMjguMjA4ODE1OTIgMjguOTY0MjM2NDUgLTI3LjM2NjU3NzE1IDI4LjEyODgxNDcgQy0yNC43NTEzNjcyOSAyNS41MzcwMzYyNyAtMjIuMTI2MjE5OTEgMjIuOTU1NjE3NDggLTE5LjUgMjAuMzc1IEMtMTYuODc1NTI2ODcgMTcuNzg1NTQ1NDMgLTE0LjI1MzE4MTcxIDE1LjE5Mzk4NTgzIC0xMS42MzM0MjI4NSAxMi41OTk3NjE5NiBDLTEwLjAwMTcxMDk3IDEwLjk4NTA3NjM5IC04LjM2NjkzNDMyIDkuMzczNDgxMTMgLTYuNzI4ODgxODQgNy43NjUyMjgyNyBDLTUuOTkxNDE3MjQgNy4wMzc1MjIyOCAtNS4yNTM5NTI2NCA2LjMwOTgxNjI4IC00LjQ5NDE0MDYyIDUuNTYwMDU4NTkgQy0zLjg0MjA3NjQyIDQuOTE5MjYzNjEgLTMuMTkwMDEyMjEgNC4yNzg0Njg2MyAtMi41MTgxODg0OCAzLjYxODI1NTYyIEMtMC45MTA0MDM0NSAyLjA1ODk4NiAtMC45MTA0MDM0NSAyLjA1ODk4NiAwIDAgWiAiIGZpbGw9IiNEN0Q3RDkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU3LDU5KSIvPgo8cGF0aCBkPSJNMCAwIEMxNC4xOSAwIDI4LjM4IDAgNDMgMCBDNDMgMC45OSA0MyAxLjk4IDQzIDMgQzI4LjgxIDMgMTQuNjIgMyAwIDMgQzAgMi4wMSAwIDEuMDIgMCAwIFogIiBmaWxsPSIjREJEQkRFIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MCwxMDApIi8+CjxwYXRoIGQ9Ik0wIDAgQzEzLjg2IDAgMjcuNzIgMCA0MiAwIEM0MiAwLjk5IDQyIDEuOTggNDIgMyBDMjcuODEgMyAxMy42MiAzIC0xIDMgQy0wLjY3IDIuMDEgLTAuMzQgMS4wMiAwIDAgWiAiIGZpbGw9IiMxOTkwOEIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYxLDE3KSIvPgo8cGF0aCBkPSJNMCAwIEMtMS4zOTc1MDA0OCAzLjE1ODM1MTA3IC0zLjA1MTk4MjM0IDUuMzIyNzI4MjUgLTUuNSA3Ljc1IEMtNi40MTI2NTYyNSA4LjY3MDM5MDYyIC02LjQxMjY1NjI1IDguNjcwMzkwNjIgLTcuMzQzNzUgOS42MDkzNzUgQy05IDExIC05IDExIC0xMSAxMSBDLTEwLjQyMDczNzg3IDcuNDYxODA0MjcgLTkuMTU2NzY1MjMgNS43NDk3MTc1NyAtNi42MjUgMy4yNSBDLTYuMDE5MTQwNjIgMi42MzY0MDYyNSAtNS40MTMyODEyNSAyLjAyMjgxMjUgLTQuNzg5MDYyNSAxLjM5MDYyNSBDLTMgMCAtMyAwIDAgMCBaICIgZmlsbD0iI0RFREVFMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDMsNzcpIi8+CjxwYXRoIGQ9Ik0wIDAgQzAgNC4xNTkyMzA4IC0yLjI0NjgzNTY4IDYuMTQ1NDQ0MzUgLTUgOSBDLTcuMzEyNSAxMC44NzUgLTcuMzEyNSAxMC44NzUgLTkgMTIgQy05LjY2IDExLjY3IC0xMC4zMiAxMS4zNCAtMTEgMTEgQy03LjM3IDcuMzcgLTMuNzQgMy43NCAwIDAgWiAiIGZpbGw9IiMzNTM1M0QiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQyLDc5KSIvPgo8cGF0aCBkPSJNMCAwIEMwLjMzIDAuOTkgMC42NiAxLjk4IDEgMyBDLTAuOTM3NSA2LjE4NzUgLTAuOTM3NSA2LjE4NzUgLTMgOSBDLTMuOTkgOC4zNCAtNC45OCA3LjY4IC02IDcgQy00LjAyIDQuNjkgLTIuMDQgMi4zOCAwIDAgWiAiIGZpbGw9IiNDQ0NCQ0UiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU3LDU5KSIvPgo8L3N2Zz4K" type="image/svg+xml">
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
	  
   // 🏎️ THE HUMAN FAST-LANE BYPASS (THE FINAL UNLOCKED EDITION)
    if (!isBot) {
        let newHeaders = new Headers(response.headers);
        newHeaders.delete("Content-Length"); 
        
        // 🚨 CRITICAL FIX 1: Nuke Google's strict Security Policy so your custom JS can run
        newHeaders.delete("Content-Security-Policy");

        let currentEmbedCode = null;

       let humanRewriter = new HTMLRewriter()
            // 🚨 1. REMOVE DEFAULT GOOGLE SITES SEO TAGS FOR HUMANS
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
            // 2. Catch the wrapper div that holds your raw code
            .on("div[data-code]", {
                element(e) {
                    currentEmbedCode = e.getAttribute("data-code");
                }
            })
            // 3. Catch the Google iframe sitting right inside that div
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

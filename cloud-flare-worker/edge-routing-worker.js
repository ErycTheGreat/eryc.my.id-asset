export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // ---------------------------------------------------------
    // ENVIRONMENT CONFIGURATION
    // Replace this with your actual production domain.
    // ---------------------------------------------------------
    const canonicalHost = "www.yourdomain.com";

    // ---------------------------------------------------------
    // 1. NAKED DOMAIN & CANONICAL PATH REDIRECTS
    // ---------------------------------------------------------
    // This intercepts traffic hitting the root domain (yourdomain.com) 
    // and forces a 301 redirect to the www subdomain. This prevents 
    // duplicate content issues in SEO and ensures consistent routing.
    // It also strips redundant paths like "/home" back to the root "/".
    const redirectResponse = handleRedirects(url, canonicalHost);
    if (redirectResponse) return redirectResponse;

    // ---------------------------------------------------------
    // 2. STATIC SEO ROUTING (Sitemap & Robots)
    // ---------------------------------------------------------
    // Closed CMS platforms often don't allow custom sitemap.xml or 
    // robots.txt. We intercept these specific paths at the edge and 
    // serve dynamically generated payloads directly to web crawlers.
    if (url.pathname === "/sitemap.xml" || url.pathname === "/sitemap.xml/") {
      return handleSitemap(canonicalHost);
    }
    if (url.pathname === "/robots.txt") {
      return handleRobots(canonicalHost);
    }

    // ---------------------------------------------------------
    // 3. THE GITHUB ASSET PROXY
    // ---------------------------------------------------------
    // Intercepts any request to /assets/ and silently proxies it 
    // to a raw GitHub repository. This acts as a free, edge-cached 
    // CDN and bypasses native platform restrictions for CSS/JS.
    if (url.pathname.startsWith("/assets/")) {
      return handleAssetProxy(url);
    }

    // ---------------------------------------------------------
    // 4. THE FAST PASS-THROUGH (Default Behavior)
    // ---------------------------------------------------------
    // If the request isn't for the homepage, sitemap, robots, or 
    // an asset, we step out of the way and let the origin server 
    // load normally. This keeps latency near zero for subpages.
    if (url.pathname !== "/") {
      return fetch(request);
    }

    // ---------------------------------------------------------
    // 5. HOMEPAGE SEO INJECTION (HTMLRewriter)
    // ---------------------------------------------------------
    // If the request makes it here, it's for the root homepage ("/").
    // We fetch the raw origin HTML, stream it through HTMLRewriter,
    // and inject our custom JSON-LD, OpenGraph tags, and metadata
    // before delivering the final response to the browser.
    return handleHtmlInjection(request, url, canonicalHost);
  }
};

// ---------------------------------------------------------
// HTML REWRITER MODULE (Safe SEO Injection)
// ---------------------------------------------------------
// This module intercepts the raw HTML from the origin server 
// and injects valid, compliant metadata and structured data 
// directly into the <head> of the document.

async function handleHtmlInjection(request, url, canonicalHost) {
  const response = await fetch(request);
  const contentType = response.headers.get("content-type") || "";

  // Failsafe: Only apply rewrites to actual HTML pages
  if (!contentType.includes("text/html")) {
      return response;
  }

  const canonicalUrl = `https://${canonicalHost}${url.pathname}`;

  // ---------------------------------------------------------
  // THE HEAD PAYLOAD (100% White-Hat SEO)
  // ---------------------------------------------------------
  const customHeaderContent = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

      <meta name="description" content="A brief, keyword-optimized description of your generic website. Keep under 160 characters.">
      <meta name="author" content="Your Name or Brand">
      <meta name="google-site-verification" content="your-google-verification-code"> 
      <link rel="canonical" href="${canonicalUrl}">
          
      <meta property="og:type" content="website">
      <meta property="og:title" content="Your Generic Page Title | Brand Name">
      <meta property="og:description" content="A brief, keyword-optimized description of your generic website.">
      <meta property="og:image" content="https://${canonicalHost}/assets/images/og-preview.webp">
      <meta property="og:url" content="${canonicalUrl}">
      
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Your Generic Page Title | Brand Name">
      <meta name="twitter:description" content="A brief, keyword-optimized description of your generic website.">
      <meta name="twitter:image" content="https://${canonicalHost}/assets/images/twitter-preview.webp">
      
      <script type="application/ld+json">
        // [INSERT YOUR GENERIC JSON-LD GRAPH HERE]
        // Example: LocalBusiness, Person, or WebSite schema
      </script>
  `;

  // ---------------------------------------------------------
  // EXECUTE REWRITER
  // ---------------------------------------------------------
  // Notice we completely removed the .on("body") cloaking logic.
  // We only inject legitimate machine-readable data into the head.
  let rewriter = new HTMLRewriter()
      .on("head", {
          element(element) {
              // Append ensures our custom tags don't overwrite native ones
              element.append(customHeaderContent, { html: true });
          }
      });

  // Because we are physically adding bytes to the HTML payload, 
  // we must delete the original Content-Length header, otherwise 
  // the browser will truncate the end of the webpage.
  let newHeaders = new Headers(response.headers);
  newHeaders.delete("Content-Length");

  return new Response(rewriter.transform(response).body, {
    status: response.status,
    headers: newHeaders
  });
}

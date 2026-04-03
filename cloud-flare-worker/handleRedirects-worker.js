// ---------------------------------------------------------
// THE REDIRECT MODULE (URL Normalization)
// ---------------------------------------------------------
// This function acts as the gatekeeper for URL consistency. 
// It enforces a single canonical domain and cleans up messy 
// Google Sites default paths to protect your SEO rankings 
// from duplicate content penalties.
function handleRedirects(url, canonicalHost) {
  
  // 1. Force Naked Domain to WWW (301 Permanent Redirect)
  // If a user or crawler hits 'eryc.my.id', they are instantly 
  // bounced to 'www.eryc.my.id' while preserving the subpath.
  if (url.hostname !== canonicalHost) {
    return Response.redirect(`https://${canonicalHost}${url.pathname}`, 301);
  }
  
  // 2. Strip Redundant "/home" Paths
  // Google Sites natively loves to append "/home" to the root.
  // We intercept this and bounce it back to the clean root "/" 
  // so Google Search Console only indexes one homepage.
  if (url.pathname === "/home" || url.pathname === "/home/") {
    return Response.redirect(`https://${canonicalHost}/`, 301);
  }
  
  // 3. Pass-Through
  // If the URL is already perfectly formatted (e.g., www + clean path),
  // return null so the main fetch router knows to proceed to the next step.
  return null; 
}

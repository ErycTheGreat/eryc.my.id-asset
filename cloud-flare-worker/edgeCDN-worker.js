// ---------------------------------------------------------
// ASSET PROXY MODULE (The Edge CDN)
// ---------------------------------------------------------
// Google Sites strips out custom <script> and <link> tags. To bypass 
// this, we use Cloudflare to silently proxy our custom assets directly 
// from a public GitHub repository. This effectively turns GitHub into 
// a free, edge-cached Content Delivery Network (CDN) for our project.

async function handleAssetProxy(url) {
  // Strip the "/assets/" prefix so we only pass the exact file path to GitHub.
  // Example: "/assets/css/style.css" becomes "css/style.css"
  const filePath = url.pathname.replace("/assets/", "");
  
  // ---------------------------------------------------------
  // GITHUB REPOSITORY CONFIGURATION
  // Replace these variables with your own repository details.
  // ---------------------------------------------------------
  const githubUser = "your-github-username"; 
  const githubRepo = "your-repo-name"; 
  const branch = "main"; // Or "master", depending on your repo structure
  
  const targetUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/${branch}/${filePath}`;
  
  // Fetch the raw asset from GitHub. 
  // We use Cloudflare's 'cf' object to aggressively cache this at the edge 
  // for a full year (31536000 seconds) so we don't spam GitHub's servers.
  let ghRes = await fetch(targetUrl, {
    cf: { cacheTtl: 31536000, cacheEverything: true }, 
  });

  // Failsafe: If the file is deleted or the URL is typed wrong, return a 404.
  if (!ghRes.ok) {
    return new Response("Asset not found on GitHub", { status: 404 });
  }

  // Copy GitHub's response headers so we can modify them
  const newHeaders = new Headers(ghRes.headers);
  
  // Force aggressive client-side caching
  newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  // Add a custom header just so we can verify the proxy is working in the network tab
  newHeaders.set("X-Proxy-Origin", "GitHub-via-Cloudflare");

  // ---------------------------------------------------------
  // CRITICAL MIME-TYPE OVERRIDES
  // ---------------------------------------------------------
  // GitHub's raw server serves almost everything as "text/plain". 
  // If we inject a .js file into an iframe but the browser thinks it's 
  // plain text, the browser will refuse to execute it. We MUST manually 
  // inspect the file extension and force the correct Content-Type.
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.endsWith(".js")) newHeaders.set("Content-Type", "application/javascript");
  else if (lowerPath.endsWith(".css")) newHeaders.set("Content-Type", "text/css");
  else if (lowerPath.endsWith(".html")) newHeaders.set("Content-Type", "text/html; charset=UTF-8");
  else if (lowerPath.endsWith(".json")) newHeaders.set("Content-Type", "application/json");
  else if (lowerPath.endsWith(".svg")) newHeaders.set("Content-Type", "image/svg+xml");
  else if (lowerPath.endsWith(".webp")) newHeaders.set("Content-Type", "image/webp");
  else if (lowerPath.endsWith(".woff")) newHeaders.set("Content-Type", "font/woff");
  else if (lowerPath.endsWith(".woff2")) newHeaders.set("Content-Type", "font/woff2");

  // Return the newly wrapped file to the browser
  return new Response(ghRes.body, { status: 200, headers: newHeaders });
}

export async function handleFaviconRequest(url) {
  const faviconFiles = [
    "/favicon.ico",
    "/favicon.svg",
    "/favicon-96x96.png",
    "/apple-touch-icon.png",
    "/site.webmanifest",
    "/web-app-manifest-192x192.png",
    "/web-app-manifest-512x512.png"
  ];

  if (faviconFiles.includes(url.pathname)) {
    const r2FaviconUrl = `https://cdn.eryc.my.id${url.pathname}`;
    const favResponse = await fetch(r2FaviconUrl);

    if (!favResponse.ok) {
      return new Response("Favicon not found in Edge Storage", { status: 404 });
    }

    const newFavResponse = new Response(favResponse.body, favResponse);
    
    // Cache statis 1 tahun (Edge & Browser)
    newFavResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    
    // Injeksi MIME Type eksplisit
    if (url.pathname.endsWith(".svg")) newFavResponse.headers.set("Content-Type", "image/svg+xml");
    else if (url.pathname.endsWith(".webmanifest")) newFavResponse.headers.set("Content-Type", "application/manifest+json");
    else if (url.pathname.endsWith(".ico")) newFavResponse.headers.set("Content-Type", "image/x-icon");
    else if (url.pathname.endsWith(".png")) newFavResponse.headers.set("Content-Type", "image/png");
    
    return newFavResponse;
  }

  // Mengembalikan null jika bukan request favicon, agar Worker utama bisa lanjut mengeksekusi routing lain
  return null;
}

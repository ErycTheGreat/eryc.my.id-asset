export function handleRobotsTxtRequest(url, canonicalHost) {
  if (url.pathname === "/robots.txt" || url.pathname === "/robots.txt/") {
    const robotsTxt = `
# Global AI Data Permissions (GEO Compliance)
Content-Signal: ai-train=yes, search=yes, ai-input=yes

# Explicitly ALLOW AI Crawlers for GEO
User-agent: OAI-SearchBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: ChatGPT-User
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: GPTBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: ClaudeBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Claude-SearchBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Claude-User
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Claude-Web
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: PerplexityBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

User-agent: Perplexity-User
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Google-Agent
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

User-agent: GoogleAgent-Search
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: GoogleAgent-Mariner
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Gemini-Deep-Research
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: GoogleOther
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Google-Extended
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

User-agent: Google Inspection Tool
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

User-agent: Googlebot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

User-agent: bingbot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

User-agent: Applebot-Extended
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: Applebot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /sitemap-main.xml

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
Allow: /llms-full.txt
Allow: /sitemap-main.xml

Sitemap: https://${canonicalHost}/sitemap-main.xml
`.trim();

    return new Response(robotsTxt, {
      status: 200,
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400" 
      }
    });
  }
  return null; 
}

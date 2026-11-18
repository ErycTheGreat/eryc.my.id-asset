// ard.js
const ARD = {
  entries: [
    {
      identifier: "urn:air:eryc.my.id:mcp:eryc-agp-edge-server",
      displayName: "Eryc AGP Edge Server",
      type: "application/mcp-server-card+json",
      url: "https://www.eryc.my.id/.well-known/mcp/server-card.json",
      description:
        "MCP server for Eryc Tri Juni S's portfolio: Edge SEO and GEO glossary search, service tiers, and consultation triggers.",
      capabilities: ["GlossarySearch", "SeoServiceTiers", "WhatsAppConsultation"],
      representativeQueries: [
        "what is edge SEO",
        "what are the service tiers for an edge SEO specialist in Malang",
        "book a consultation with an edge SEO and GEO specialist",
      ],
    },
  ],
};

export function handleARDRequest() {
  return new Response(JSON.stringify(ARD, null, 2), {
    headers: {
      "content-type": "application/ard+json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600",
    },
  });
}

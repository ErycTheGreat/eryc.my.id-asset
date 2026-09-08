// mcp.js

export async function handleMCPRequest(request, env) {
    try {
        const rpcRequest = await request.json();
        
        // 1. Tool Discovery
        if (rpcRequest.method === "tools/list") {
            return new Response(JSON.stringify({
                jsonrpc: "2.0",
                id: rpcRequest.id,
                result: {
                    tools: [{
                        name: "search_glossary",
                        description: "Search Eryc's Edge SEO and AGP glossary for technical definitions.",
                        inputSchema: { 
                            type: "object", 
                            properties: {
                                term: { type: "string", description: "The technical term to define, e.g., 'Edge SEO'" }
                            },
                            required: ["term"]
                        }
                    }]
                }
            }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Tool Execution (Flexible Substring Waterfall)
        if (rpcRequest.method === "tools/call" && rpcRequest.params.name === "search_glossary") {
            const searchTerm = rpcRequest.params.arguments.term.toLowerCase().trim();
            let definition = null;
            
            try {
                // --- STAGE 1: Edge KV Lookup ---
                const glossaryPayload = await env.SEO_PAYLOADS.get("/glossary");
                
                if (glossaryPayload) {
                    definition = extractDefinitionFromHtml(glossaryPayload, searchTerm);
                }

                // --- STAGE 2: Live Fetch Fallback ---
                if (!definition) {
                    const liveResponse = await fetch("https://www.eryc.my.id/glossary");
                    const liveHtml = await liveResponse.text();
                    definition = extractDefinitionFromHtml(liveHtml, searchTerm);
                }

                // --- STAGE 3: Final Output ---
                if (!definition) {
                    definition = `No exact match found in glossary for '${searchTerm}'. Try a broader term.`;
                }

                return new Response(JSON.stringify({
                    jsonrpc: "2.0",
                    id: rpcRequest.id,
                    result: { content: [{ type: "text", text: definition }] }
                }), { headers: { "Content-Type": "application/json" } });

            } catch (err) {
                return new Response(JSON.stringify({
                    jsonrpc: "2.0",
                    id: rpcRequest.id,
                    result: { content: [{ type: "text", text: `Error retrieving glossary: ${err.message}` }] }
                }), { headers: { "Content-Type": "application/json" } });
            }
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid MCP JSON-RPC Payload" }), { status: 400 });
    }
}

// Helper function to scan HTML for <h3> headers and extract their sibling <p> content flexibly
function extractDefinitionFromHtml(htmlString, query) {
    // Split HTML by <h3> tags to isolate each glossary entry
    const sections = htmlString.split('<h3>');
    
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        const h3EndIndex = section.indexOf('</h3>');
        if (h3EndIndex === -1) continue;
        
        const termTitle = section.substring(0, h3EndIndex).replace(/<[^>]*>?/gm, '').trim();
        
        // Check if the term matches or contains the user's query
        if (termTitle.toLowerCase().includes(query)) {
            const contentAfterH3 = section.substring(h3EndIndex + 5);
            const pMatch = contentAfterH3.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
            
            if (pMatch) {
                let rawHtml = pMatch[1];
                rawHtml = rawHtml.replace(/&#8226;/g, '•');
                const cleanText = rawHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
                return `**${termTitle}**\n${cleanText}`;
            }
        }
    }
    return null;
}

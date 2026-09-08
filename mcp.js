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
    // Split by glossary items to isolate individual definitions
    const items = htmlString.split('class="glossary-item"');
    
    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const h3Match = item.match(/<h3>([\s\S]*?)<\/h3>/i);
        
        if (h3Match) {
            const termTitle = h3Match[1].replace(/<[^>]*>?/gm, '').trim();
            
            // Match the term title accurately
            if (termTitle.toLowerCase().includes(query)) {
                const pMatch = item.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
                
                if (pMatch) {
                    let rawHtml = pMatch[1];
                    rawHtml = rawHtml.replace(/&#8226;/g, '•');
                    const cleanText = rawHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
                    return `**${termTitle}**\n${cleanText}`;
                }
            }
        }
    }
    return null;
}

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

        // 2. Tool Execution (Temporary Test Swap: JSON-LD First)
        if (rpcRequest.method === "tools/call" && rpcRequest.params.name === "search_glossary") {
            const searchTerm = rpcRequest.params.arguments.term.toLowerCase().trim();
            let definition = null;
            
            try {
                // --- STAGE 1 (TEST): Live Fetch JSON-LD Parsing First ---
                const liveResponse = await fetch("https://www.eryc.my.id/glossary");
                const liveHtml = await liveResponse.text();
                
                const jsonLdMatch = liveHtml.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
                
                if (jsonLdMatch) {
                    try {
                        const schema = JSON.parse(jsonLdMatch[1]);
                        if (schema["@graph"]) {
                            const terms = schema["@graph"].filter(item => item["@type"] === "DefinedTerm");
                            const foundTerm = terms.find(t => 
                                t.name.toLowerCase() === searchTerm || 
                                (t.alternateName && t.alternateName.toLowerCase() === searchTerm)
                            );
                            
                            if (foundTerm) {
                                definition = `**(Extracted via Live JSON-LD)**\n**${foundTerm.name}** (${foundTerm.alternateName || ''}): ${foundTerm.description}`;
                            }
                        }
                    } catch (e) { /* JSON parse error fallback */ }
                }

                // --- STAGE 2 (FALLBACK): Edge KV Lookup ---
                if (!definition) {
                    const glossaryPayload = await env.SEO_PAYLOADS.get("/glossary");
                    if (glossaryPayload) {
                        definition = extractDefinitionFromHtml(glossaryPayload, searchTerm);
                        if (definition) definition = `**(Extracted via Edge HTML)**\n` + definition;
                    }
                }

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

// Bulletproof regex scanner for <dt> and <dd> glossary terms
function extractDefinitionFromHtml(htmlString, query) {
    const regex = /<dt>\s*(?:<strong>)?([\s\S]*?)(?:<\/strong>)?\s*<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi;
    let match;

    while ((match = regex.exec(htmlString)) !== null) {
        const termTitle = match[1].replace(/<[^>]*>?/gm, '').trim();
        
        if (termTitle.toLowerCase().includes(query)) {
            let rawHtml = match[2];
            rawHtml = rawHtml.replace(/&#8226;/g, '•');
            const cleanText = rawHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
            return `**${termTitle}**\n${cleanText}`;
        }
    }
    return null;
}

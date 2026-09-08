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
                    tools: [
                        {
                            name: "search_glossary",
                            description: "Search Eryc's Edge SEO and AGP glossary for technical definitions.",
                            inputSchema: { 
                                type: "object", 
                                properties: {
                                    term: { type: "string", description: "The technical term to define, e.g., 'Edge SEO'" }
                                },
                                required: ["term"]
                            }
                        },
                        {
                            name: "execute_terminal_command",
                            description: "Execute interactive ERYC-OS terminal commands (whoami, proof, skill, remote, scan, ls, sudo, matrix).",
                            inputSchema: { 
                                type: "object", 
                                properties: {
                                    command: { 
                                        type: "string", 
                                        enum: ["whoami", "proof", "skill", "remote", "scan", "sysinfo", "ls", "sudo", "matrix"],
                                        description: "The terminal command to simulate execution for." 
                                    }
                                },
                                required: ["command"]
                            }
                        }
                    ]
                }
            }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Tool Execution Routing
        if (rpcRequest.method === "tools/call") {
            const toolName = rpcRequest.params.name;
            const args = rpcRequest.params.arguments || {};
            let resultText = null;

            try {
                // --- TOOL A: search_glossary ---
                if (toolName === "search_glossary") {
                    const searchTerm = args.term.toLowerCase().trim();
                    
                    // Stage 1: Edge KV Lookup
                    const glossaryPayload = await env.SEO_PAYLOADS.get("/glossary");
                    if (glossaryPayload) {
                        resultText = extractDefinitionFromHtml(glossaryPayload, searchTerm);
                    }

                    // Stage 2: Live Fetch Fallback
                    if (!resultText) {
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
                                        resultText = `**${foundTerm.name}** (${foundTerm.alternateName || ''}): ${foundTerm.description}`;
                                    }
                                }
                            } catch (e) { /* JSON parse error fallback */ }
                        }
                    }

                    if (!resultText) {
                        resultText = `No exact match found in glossary for '${searchTerm}'. Try a broader term.`;
                    }
                }

                // --- TOOL B: execute_terminal_command ---
                else if (toolName === "execute_terminal_command") {
                    const cmd = args.command.toLowerCase().trim();

                    switch (cmd) {
                        case "whoami":
                            resultText = "I wear two hats: Engineer & Digital Marketer. My engineering roots fuel my data-driven strategies, allowing me to engineer constraint-bypassing web architectures and full-stack funnels. No B.S. Constraint doesn't stop me — I bend physical law around it. Documented on YouTube (@ErycTriJuniS).";
                            break;
                        case "proof":
                            resultText = "B.Eng in Electrical & Electronics Engineering. Google Digital Marketing & E-commerce Professional Certificate. This site runs on Edge SEO via Asymmetric Ghost Payload (AGP) architecture (Cloudflare Workers + GitHub asset proxy). Repo: github.com/ErycTheGreat/eryc.my.id-asset";
                            break;
                        case "skill":
                            resultText = "Edge SEO: AGP Architecture, Cloudflare Workers, GEO, Technical SEO, Web Dev. Marketing: Content Strategy, Data Analysis, Funnel Optimization, Google Analytics, TikTok Marketing. Transferable: Business Analysis, Problem Solving.";
                            break;
                        case "remote":
                            resultText = "Open to remote full-time or contract roles, alongside independent consulting — priority region Australia / APAC. Based in Malang, Indonesia (WIB, UTC+7).";
                            break;
                        case "scan":
                        case "sysinfo":
                            resultText = "ERYC-OS Diagnostics: CPU: Multi-Core Edge Node, RAM: High-Speed V8 Isolates, Status: Operational. Life difficulty: nightmare. Geodata resolved: Malang, East Java, Indonesia.";
                            break;
                        case "ls":
                            resultText = "Available terminal commands: whoami, proof, skill, remote, scan, sysinfo, ls, sudo, matrix, clear.";
                            break;
                        case "sudo":
                            resultText = "Wake up, Neo... The Matrix has you. Knock, knock, Neo. [Easter Egg Triggered: Follow the white rabbit]";
                            break;
                        case "matrix":
                            resultText = "Initializing digital rain sequence... follow the white rabbit.";
                            break;
                        case "clear":
                            resultText = "Terminal buffer wiped clean.";
                            break;
                        default:
                            resultText = `command not found: ${cmd}`;
                    }
                } else {
                    resultText = `Unknown tool: ${toolName}`;
                }

                return new Response(JSON.stringify({
                    jsonrpc: "2.0",
                    id: rpcRequest.id,
                    result: { content: [{ type: "text", text: resultText }] }
                }), { headers: { "Content-Type": "application/json" } });

            } catch (err) {
                return new Response(JSON.stringify({
                    jsonrpc: "2.0",
                    id: rpcRequest.id,
                    result: { content: [{ type: "text", text: `Execution error: ${err.message}` }] }
                }), { headers: { "Content-Type": "application/json" } });
            }
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid MCP JSON-RPC Payload" }), { status: 400 });
    }
}

// Bulletproof regex scanner for <dt> and <dd> glossary terms
function extractDefinitionFromHtml(htmlString, query) {
    const regex = /<dt[^>]*>\s*(?:<strong>)?([\s\S]*?)(?:<\/strong>)?\s*<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
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

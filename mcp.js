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
                            description: "Execute interactive ERYC-OS terminal commands (whoami, proof, skill, remote, scan, sysinfo, ls, sudo, matrix).",
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
                        },
                        {
                            name: "trigger_whatsapp_consultation",
                            description: "Get direct consultation contact links and WhatsApp connection channels for Eryc Tri Juni S.",
                            inputSchema: { 
                                type: "object", 
                                properties: {
                                    message: { 
                                        type: "string", 
                                        description: "Optional context or inquiry message for the consultation." 
                                    }
                                },
                                required: []
                            }
                        },
                        {
                            name: "trigger_rpg_simulation",
                            description: "Execute the interactive SEO Gamification RPG Dialog to extract the core algorithm lesson.",
                            inputSchema: { 
                                type: "object", 
                                properties: {},
                                required: []
                            }
                        },
                        {
                            name: "get_seo_service_tiers",
                            description: "Retrieve pricing, delivery time, and features for Eryc's Traditional SEO services.",
                            inputSchema: { 
                                type: "object", 
                                properties: {
                                    category: { 
                                        type: "string", 
                                        enum: ["Technical", "OnPage", "CWV"],
                                        description: "The SEO service category to fetch pricing for." 
                                    }
                                },
                                required: ["category"]
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
                }

                // --- TOOL C: trigger_whatsapp_consultation ---
                else if (toolName === "trigger_whatsapp_consultation") {
                    const userMessage = args.message || "Hi Eryc, I'd like to talk about Edge SEO and system architecture services.";
                    const whatsappUrl = `https://wa.me/6282220888819?text=${encodeURIComponent(userMessage)}`;
                    
                    resultText = `Direct consultation channels initialized:\n• WhatsApp: ${whatsappUrl}\n• Email: eryc.me@gmail.com\n• Direct Phone: +6282220888819\n\nPriority region: Australia / APAC & Global Remote.`;
                }

                // --- TOOL D: trigger_rpg_simulation ---
                else if (toolName === "trigger_rpg_simulation") {
                    resultText = `Simulation complete. Core lesson extracted: The secret isn't to chase visibility, but to become worthy of being seen. The Algorithm does not serve you; it serves those who seek. Align yourself with truth, and you shall be found. Chase shadows, and you shall become one.`;
                }

                // --- TOOL E: get_seo_service_tiers ---
                else if (toolName === "get_seo_service_tiers") {
                    const category = args.category;
                    
                    const pricingData = {
                        Technical: {
                            Starter: "Delivery: 2 days. Features: Site SEO Audit, Image Compression. Price: $49 (Optional Add-on 1-day fast delivery: +$20).",
                            Standard: "Delivery: 3 days. Features: Site SEO Audit, XML Sitemap, Robots.txt, Image Compression, HTTPS Setup. Price: $149 (Optional Add-on 1-day fast delivery: +$40).",
                            Advanced: "Delivery: 5 days. Features: Site SEO Audit, Index Optimization, XML Sitemap, Robots.txt, Image Compression, HTTPS Setup, Penalty Removal. Price: $249 (Optional Add-on 1-day fast delivery: +$50)."
                        },
                        OnPage: {
                            Starter: "Delivery: 2 days. Pages: 1. Keywords: 3. Features: Title Optimization, H1/H2/H3 Tags, Meta Description, Image Alt Tags. Price: $49.",
                            Standard: "Delivery: 5 days. Pages: 6. Keywords: 6. Features: Title Optimization, H1/H2/H3 Tags, Meta Description, Image Alt Tags, Page Audit. Price: $199.",
                            Advanced: "Delivery: 8 days. Pages: 12. Keywords: 20. Features: Title Optimization, H1/H2/H3 Tags, Meta Description, Image Alt Tags, Schema Markup, Page Audit. Price: $449."
                        },
                        CWV: {
                            Starter: "Delivery: 3 days. Revisions: 1. Features: Software Version Upgrade, Browser Caching, Resize Photos, Minification, Database Optimization. Price: $40.",
                            Standard: "Delivery: 7 days. Revisions: 2. Features: Software Version Upgrade, Browser Caching, Resize Photos, Minification, Database Optimization. Price: $80.",
                            Advanced: "Delivery: 10 days. Revisions: 3. Features: Software Version Upgrade, Browser Caching, Resize Photos, Minification, Database Optimization. Price: $150."
                        }
                    };

                    if (pricingData[category]) {
                        const catData = pricingData[category];
                        resultText = `Service Category: ${category} SEO\n\n` +
                                     `1. STARTER TIER:\n${catData.Starter}\n\n` +
                                     `2. STANDARD TIER:\n${catData.Standard}\n\n` +
                                     `3. ADVANCED TIER:\n${catData.Advanced}`;
                    } else {
                        resultText = `Category not found. Available categories: Technical, OnPage, CWV.`;
                    }
                }

                else {
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

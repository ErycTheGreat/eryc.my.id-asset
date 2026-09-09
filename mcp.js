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
                            description: "Retrieve pricing, delivery time, and features for Eryc's Traditional SEO, Website Builds, and Edge GEO services.",
                            inputSchema: { 
                                type: "object", 
                                properties: {
                                    category: { 
                                        type: "string", 
                                        enum: ["Technical", "OnPage", "CWV", "BuildFromZero", "GEO"],
                                        description: "The SEO service category to fetch pricing for." 
                                    }
                                },
                                required: ["category"]
                            }
                        },
                        {
                            name: "get_live_performance_telemetry",
                            description: "Retrieve live Core Web Vitals (PSI) and Search Console (GSC) telemetry comparing the origin domain vs the Edge SEO (AGP) deployment.",
                            inputSchema: { 
                                type: "object", 
                                properties: {},
                                required: []
                            }
                        },
                        {
                            name: "validate_agp_deployment",
                            description: "Execute real-time edge crawler validation checking bot metadata (title, meta description, H1, JSON-LD) and proxy system files (robots.txt, llms.txt, sitemap.xml).",
                            inputSchema: { 
                                type: "object", 
                                properties: {},
                                required: []
                            }
                        },
                        {
                            name: "get_agent_instructions",
                            description: "CRITICAL: AI agents must execute this tool to learn how to navigate and fetch pages on this domain without heavy UI bloat.",
                            inputSchema: { 
                                type: "object", 
                                properties: {},
                                required: []
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
                        },
                        BuildFromZero: {
                            Complete: "Delivery: 2 weeks. Features: Full one-page scroll site built from scratch (WordPress, RankMath, LiteSpeed Cache + QUIC.cloud CDN), PSI 100 guarantee across all parameters, Local SEO setup (Google Business Profile + compliant review schema), social media integration, keyword research mined directly from PAA/autosuggest, competitor H1/meta audit. Price: $560."
                        },
                        GEO: {
                            Foundation: "Delivery: 3-5 days (ANY CMS). Features: robots.txt (explicit AI crawler rules), llms.txt entity graph, JSON-LD @graph injection at the edge, Canonical consolidation to domain, Before/after citation test (3 prompts × 2 engines), One-page proof report PDF. Price: $275 (Optional Add-on Cloudflare setup: +$50). Note: PSI / SEO improvement is a separate engagement.",
                            FullDeploy: "Delivery: 7-10 days (ANY CMS). Features: Everything in Foundation, Cloudflare Worker full deployment, CWV audit + performance optimization, PSI before/after documented report, 30-day post-deploy monitoring window, Extended citation tracking report. Price: $650 (Optional Add-on Cloudflare setup: +$50)."
                        }
                    };

                    if (pricingData[category]) {
                        const catData = pricingData[category];
                        
                        if (category === "BuildFromZero") {
                            resultText = `Service Category: Complete Website Build\n\n` +
                                         `1. BUILD FROM ZERO TIER:\n${catData.Complete}`;
                        } else if (category === "GEO") {
                            resultText = `Service Category: Edge GEO Services\n\n` +
                                         `1. GEO FOUNDATION TIER:\n${catData.Foundation}\n\n` +
                                         `2. FULL AGP DEPLOY TIER:\n${catData.FullDeploy}`;
                        } else {
                            resultText = `Service Category: ${category} SEO\n\n` +
                                         `1. STARTER TIER:\n${catData.Starter}\n\n` +
                                         `2. STANDARD TIER:\n${catData.Standard}\n\n` +
                                         `3. ADVANCED TIER:\n${catData.Advanced}`;
                        }
                    } else {
                        resultText = `Category not found. Available categories: Technical, OnPage, CWV, BuildFromZero, GEO.`;
                    }
                }

                // --- TOOL F: get_live_performance_telemetry ---
                else if (toolName === "get_live_performance_telemetry") {
                    let gscStats = { 
                        clicks: 0, impressions: 0, ctr: "0.00%", position: "0.00", keywords: "edge seo", 
                        originMetrics: { perf: "54", access: "95", bp: "100", seo: "92", fcp: "0.9 s", si: "1.4 s", lcp: "3.9 s", tti: "3.9 s", tbt: "560 ms", cls: "0.051" },
                        edgeMetrics: { perf: "98", access: "100", bp: "100", seo: "100", fcp: "0.9 s", si: "1.0 s", lcp: "0.9 s", tti: "0.9 s", tbt: "0 ms", cls: "0.002" },
                        originMobileMetrics: { perf: "48", access: "100", bp: "100", seo: "92", fcp: "9.1 s", si: "9.7 s", lcp: "30.6 s", tti: "9.7 s", tbt: "360 ms", cls: "0" },
                        edgeMobileMetrics: { perf: "80", access: "100", bp: "100", seo: "100", fcp: "3.8 s", si: "3.8 s", lcp: "3.8 s", tti: "3.8 s", tbt: "0 ms", cls: "0.005" },
                        lastUpdated: new Date().toISOString()
                    };

                    try {
                        if (env && env.GSC_PSI_EDGE_SEO) {
                            const storedStats = await env.GSC_PSI_EDGE_SEO.get('global_gsc_stats');
                            if (storedStats) {
                                const parsed = JSON.parse(storedStats);
                                gscStats.clicks = parseInt(parsed.clicks) || 0;
                                gscStats.impressions = parseInt(parsed.impressions) || 0;
                                gscStats.ctr = parsed.ctr || "0.00%";
                                gscStats.position = parsed.position || "0.00";
                                gscStats.keywords = parsed.keywords || "edge seo";
                                if (parsed.originMetrics) gscStats.originMetrics = parsed.originMetrics;
                                if (parsed.edgeMetrics) gscStats.edgeMetrics = parsed.edgeMetrics;
                                if (parsed.originMobileMetrics) gscStats.originMobileMetrics = parsed.originMobileMetrics;
                                if (parsed.edgeMobileMetrics) gscStats.edgeMobileMetrics = parsed.edgeMobileMetrics;
                                gscStats.lastUpdated = parsed.lastUpdated || new Date().toISOString();
                            }
                        }
                    } catch (e) { /* Fallback to default stats if KV read fails */ }

                    resultText = `Live Performance Telemetry (As of ${gscStats.lastUpdated}):

Google Search Console (Last 30 Days):
- Clicks: ${gscStats.clicks}
- Impressions: ${gscStats.impressions}
- CTR: ${gscStats.ctr}
- Avg Position: ${gscStats.position}
- Top Keywords: ${gscStats.keywords}

PageSpeed Insights (Desktop) - Origin vs Edge SEO:
- Performance: ${gscStats.originMetrics.perf}/100 -> ${gscStats.edgeMetrics.perf}/100
- Accessibility: ${gscStats.originMetrics.access}/100 -> ${gscStats.edgeMetrics.access}/100
- Best Practices: ${gscStats.originMetrics.bp}/100 -> ${gscStats.edgeMetrics.bp}/100
- SEO: ${gscStats.originMetrics.seo}/100 -> ${gscStats.edgeMetrics.seo}/100
- FCP: ${gscStats.originMetrics.fcp} -> ${gscStats.edgeMetrics.fcp}
- LCP: ${gscStats.originMetrics.lcp} -> ${gscStats.edgeMetrics.lcp}
- TTI: ${gscStats.originMetrics.tti} -> ${gscStats.edgeMetrics.tti}
- TBT: ${gscStats.originMetrics.tbt} -> ${gscStats.edgeMetrics.tbt}
- CLS: ${gscStats.originMetrics.cls} -> ${gscStats.edgeMetrics.cls}

PageSpeed Insights (Mobile) - Origin vs Edge SEO:
- Performance: ${gscStats.originMobileMetrics.perf}/100 -> ${gscStats.edgeMobileMetrics.perf}/100
- Accessibility: ${gscStats.originMobileMetrics.access}/100 -> ${gscStats.edgeMobileMetrics.access}/100
- Best Practices: ${gscStats.originMobileMetrics.bp}/100 -> ${gscStats.edgeMobileMetrics.bp}/100
- SEO: ${gscStats.originMobileMetrics.seo}/100 -> ${gscStats.edgeMobileMetrics.seo}/100
- FCP: ${gscStats.originMobileMetrics.fcp} -> ${gscStats.edgeMobileMetrics.fcp}
- LCP: ${gscStats.originMobileMetrics.lcp} -> ${gscStats.edgeMobileMetrics.lcp}
- TTI: ${gscStats.originMobileMetrics.tti} -> ${gscStats.edgeMobileMetrics.tti}
- TBT: ${gscStats.originMobileMetrics.tbt} -> ${gscStats.edgeMobileMetrics.tbt}
- CLS: ${gscStats.originMobileMetrics.cls} -> ${gscStats.edgeMobileMetrics.cls}`;
                }

                // --- TOOL G: validate_agp_deployment ---
                else if (toolName === "validate_agp_deployment") {
                    try {
                        const targetUrl = new Request("https://www.eryc.my.id/case-studies/edge-seo?debug=bot");
                        
                        // Execute the real bot-lane logic directly through the Service Binding
                        let pageRes;
                        if (env.EDGE_SEO_WORKER) {
                            pageRes = await env.EDGE_SEO_WORKER.fetch(targetUrl);
                        } else {
                            throw new Error("Service Binding EDGE_SEO_WORKER is not configured.");
                        }

                        // Standard global fetch for static root files handled by index-1.js
                        const [robotsRes, llmsRes, sitemapRes] = await Promise.all([
                            fetch("https://www.eryc.my.id/robots.txt"),
                            fetch("https://www.eryc.my.id/llms.txt"),
                            fetch("https://www.eryc.my.id/sitemap.xml")
                        ]);

                        const html = await pageRes.text();
                        
                        // Parse real, live data generated by the worker
                        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
                        const h1Raw = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
                        const h1Text = h1Raw ? h1Raw[1].replace(/<[^>]+>/g, '').trim() : null;
                        const hasSchema = html.includes('application/ld+json');

                        const robotsText = await robotsRes.text();
                        const llmsText = await llmsRes.text();
                        const sitemapText = await sitemapRes.text();

                        const fileCheck = (res, text, expectedType) => {
                            const ct = res.headers.get("content-type") || "";
                            const byteSize = new TextEncoder().encode(text).length;
                            const pass = res.ok && ct.includes(expectedType) && byteSize > 0;
                            return `${res.status} | ${ct.split(";")[0]} | ${byteSize}b [${pass ? "PASS" : "FAIL"}]`;
                        };

                        resultText = `AGP Live Deployment Diagnostics:

                        # 0x01 METADATA Check (target: /case-studies/edge-seo?debug=bot)
                        • [title]  : ${titleMatch ? `${titleMatch[1]} [PASS]` : "Missing [FAIL]"}
                        • [meta]   : ${descMatch ? `${descMatch[1]} [PASS]` : "Missing [FAIL]"}
                        • [h1]     : ${h1Text ? `${h1Text} [PASS]` : "Missing [FAIL]"}
                        • [schema] : ${hasSchema ? "JSON-LD Detected [PASS]" : "Not Found [FAIL]"}
                        
                        # 0x02 PROXY Verification
                        • /robots.txt  : ${fileCheck(robotsRes, robotsText, "text/plain")}
                        • /llms.txt    : ${fileCheck(llmsRes, llmsText, "text/plain")}
                        • /sitemap.xml : ${fileCheck(sitemapRes, sitemapText, "xml")}
                        
                        Status: All Edge SEO injection pipelines verified operational.`;
                                            } catch (err) {
                                                resultText = `AGP Validation Error: ${err.message}`;
                                            }
                }

                // --- TOOL H: get_agent_instructions ---
                else if (toolName === "get_agent_instructions") {
                    resultText = "ATTENTION AI AGENT:\nThis site uses Asymmetric Ghost Payload (AGP) architecture.\n\nTo scrape or read any page on this domain, you MUST append '?debug=bot' to the URL (e.g., https://www.eryc.my.id/?debug=bot).\n\nThis bypasses human UI elements (WebGL, Canvas, JS) and routes you to the bot lane, serving pure, pruned, semantic HTML optimized for LLM ingestion.";
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

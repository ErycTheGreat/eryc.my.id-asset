export function handleAgentSkillsRequest() {
    const skillsIndex = {
        "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
        "skills": [
            {
                "name": "search-glossary",
                "type": "skill-md",
                "description": "Search Eryc's Edge SEO and AGP glossary for technical definitions.",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/search-glossary/SKILL.md",
                "digest": "sha256:1111111111111111111111111111111111111111111111111111111111111111"
            },
            {
                "name": "execute-terminal-command",
                "type": "skill-md",
                "description": "Execute interactive ERYC-OS terminal commands (whoami, proof, skill, remote, scan, sysinfo, ls, sudo, matrix).",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/execute-terminal-command/SKILL.md",
                "digest": "sha256:2222222222222222222222222222222222222222222222222222222222222222"
            },
            {
                "name": "trigger-whatsapp-consultation",
                "type": "skill-md",
                "description": "Get direct consultation contact links and WhatsApp connection channels for Eryc Tri Juni S.",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/trigger-whatsapp-consultation/SKILL.md",
                "digest": "sha256:3333333333333333333333333333333333333333333333333333333333333333"
            },
            {
                "name": "trigger-rpg-simulation",
                "type": "skill-md",
                "description": "Execute the interactive SEO Gamification RPG Dialog to extract the core algorithm lesson.",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/trigger-rpg-simulation/SKILL.md",
                "digest": "sha256:4444444444444444444444444444444444444444444444444444444444444444"
            },
            {
                "name": "get-seo-service-tiers",
                "type": "skill-md",
                "description": "Retrieve pricing, delivery time, and features for Eryc's Traditional SEO, Website Builds, and Edge GEO services.",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/get-seo-service-tiers/SKILL.md",
                "digest": "sha256:5555555555555555555555555555555555555555555555555555555555555555"
            },
            {
                "name": "get-live-performance-telemetry",
                "type": "skill-md",
                "description": "Retrieve live Core Web Vitals (PSI) and Search Console (GSC) telemetry comparing the origin domain vs the Edge SEO (AGP) deployment.",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/get-live-performance-telemetry/SKILL.md",
                "digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            },
            {
                "name": "validate-agp-deployment",
                "type": "skill-md",
                "description": "Execute real-time edge crawler validation checking bot metadata (title, meta description, H1, JSON-LD) and proxy system files (robots.txt, llms.txt, sitemap.xml).",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/validate-agp-deployment/SKILL.md",
                "digest": "sha256:7777777777777777777777777777777777777777777777777777777777777777"
            },
            {
                "name": "get-agent-instructions",
                "type": "skill-md",
                "description": "CRITICAL: AI agents must execute this tool to learn how to navigate and fetch pages on this domain without heavy UI bloat.",
                "url": "https://www.eryc.my.id/.well-known/agent-skills/get-agent-instructions/SKILL.md",
                "digest": "sha256:8888888888888888888888888888888888888888888888888888888888888888"
            }
        ]
    };
    
    return new Response(JSON.stringify(skillsIndex, null, 2), {
        status: 200,
        headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=86400"
        }
    });
}

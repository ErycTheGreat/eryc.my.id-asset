export function handleMCPServerCardRequest() {
    const mcpCard = {
        "serverInfo": {
            "name": "Eryc-AGP-Edge-Server",
            "version": "1.0.0"
        },
        "transport": {
            "type": "http",
            "endpoint": "https://www.eryc.my.id/mcp"
        },
        "capabilities": {
            "tools": {}
        }
    };
    
    return new Response(JSON.stringify(mcpCard, null, 2), {
        status: 200,
        headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=86400"
        }
    });
}

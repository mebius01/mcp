import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TOOLS } from "./tools.js";
import { PROMPTS } from "./prompts.js";

async function main() {
  const transport = new StdioServerTransport();
  const server = new McpServer({
    name: "notion-mcp-server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: TOOLS,
      prompts: PROMPTS,
    },
  });

  for (const tool of TOOLS) {
    server.registerTool(tool.name, {
      title: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    },
      tool.callback
    );
  }

  for (const prompt of PROMPTS) {
    server.registerPrompt(prompt.name, {
      title: prompt.name,
      description: prompt.description,
      argsSchema: prompt.argsSchema
    },
      prompt.callback
    );
  }

  await server.connect(transport);
}

main().catch((err) => {
  console.error("❌ MCP server failed:", err);
  process.exit(1);
});


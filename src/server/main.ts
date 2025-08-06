import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TOOLS } from "./content/tools.js";
import { PROMPTS } from "./content/prompts.js";
import { RESOURCES } from "./content/resources.js";

async function main() {
  const transport = new StdioServerTransport();
  const server = new McpServer({
    name: "local-mcp-server",
    version: "1.0.0",
    capabilities: {
      resources: RESOURCES,
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

  for (const resource of RESOURCES) {
    server.registerResource(resource.name, resource.uri, {
      title: resource.name,
      description: resource.description,
      mimeType: resource.mimeType
    },
      resource.callback);
  }

  await server.connect(transport);
}

main().catch((err) => {
  console.error("❌ MCP server failed:", err);
  process.exit(1);
});


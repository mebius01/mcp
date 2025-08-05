import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { IMCPClient, MCPServerConfig } from "../interface.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class MCPClient implements IMCPClient {
  private clients: Record<
    string,
    {
      mcp: Client;
      transport: StdioClientTransport;
      tools: Tool[];
    }
  > = {};

  async connect(configs: Record<string, MCPServerConfig>) {
    for (const [name, cfg] of Object.entries(configs)) {
      const transport = new StdioClientTransport(
        {
          command: cfg.command,
          args: cfg.args,
          env: cfg.env,
        }
      );

      const mcp = new Client(
        {
          name: `mcp-${name}`,
          version: "1.0.0"
        }
      );

      await mcp.connect(transport);

      const { tools } = await mcp.listTools();

      this.clients[name] = { mcp, transport, tools };

      console.log(`\n\nConnected to ${name} \n✅Tools: ${tools.map(t => t.name).join(", ")}`);
    }
  }

  async disconnect() {
    for (const [name, { mcp, transport }] of Object.entries(this.clients)) {
      await mcp.close();
      await transport.close();
      console.log(`🔌 Disconnected from "${name}"`);
    }
    this.clients = {};
  }

  listTools(): Tool[] {
    return Object.values(this.clients).flatMap(({ tools }) => tools);
  }

  getClient(toolName: string): Client | undefined {
    for (const { mcp, tools } of Object.values(this.clients)) {
      if (tools.some(t => t.name === toolName)) return mcp;
    }
  }
}
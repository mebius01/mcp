import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { IMCPClient, MCPServerConfig } from "../interface.js";
import { Tool, Prompt, Resource } from "@modelcontextprotocol/sdk/types.js";

export class MCPClient implements IMCPClient {
  private clients: Record<
    string,
    {
      mcp: Client;
      transport: StdioClientTransport;
      tools: Tool[];
      prompts: Prompt[];
      resources: Resource[];
    }
  > = {};

  private logConnect(name: string, tools: Tool[], prompts: Prompt[], resources: Resource[]) {
    const resourcesInfo = resources.length > 0 ? `\n📄 Resources: ${resources.map(r => r.name).join(", ")}` : "";
    const promptsInfo = prompts.length > 0 ? `\n💬 Prompts: ${prompts.map(p => p.name).join(", ")}` : "";
    console.log(`\n\nConnected to ${name} \n⚒️ Tools: ${tools.map(t => t.name).join(", ")}${promptsInfo}${resourcesInfo}`);
  }

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

      let prompts: Prompt[] = [];
      try {
        const promptsResult = await mcp.listPrompts();
        prompts = promptsResult.prompts || [];
      } catch (error) {
        console.error(`⚠️  Server "${name}" doesn't support prompts`);
        prompts = [];
      }

      let resources: Resource[] = [];
      try {
        const resourcesResult = await mcp.listResources();
        resources = resourcesResult.resources || [];
      } catch (error) {
        console.error(`⚠️  Server "${name}" doesn't support resources`);
        resources = [];
      }

      this.clients[name] = { mcp, transport, tools, prompts, resources };

      this.logConnect(name, tools, prompts, resources);
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

  listPrompts(): Prompt[] {
    return Object.values(this.clients).flatMap(({ prompts }) => prompts);
  }

  listResources(): Resource[] {
    return Object.values(this.clients).flatMap(({ resources }) => resources);
  }

  getClient(toolName: string): Client | undefined {
    for (const { mcp, tools } of Object.values(this.clients)) {
      if (tools.some(t => t.name === toolName)) return mcp;
    }
  }
}
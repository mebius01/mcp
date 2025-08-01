import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ChatCompletionTool } from "openai/resources";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPServerConfig } from "../interface.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}


export class MCPClient {
  private openai: OpenAI;
  private clients: Record<
    string,
    {
      mcp: Client;
      transport: StdioClientTransport;
      tools: ChatCompletionTool[];
    }
  > = {};

  constructor() {
    this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  async connectAll(configs: Record<string, MCPServerConfig>) {
    for (const [name, cfg] of Object.entries(configs)) {
      const transport = new StdioClientTransport({
        command: cfg.command,
        args: cfg.args,
        env: cfg.env,
      });

      const mcp = new Client({ name: `mcp-${name}`, version: "1.0.0" });

      await mcp.connect(transport);

      const { tools } = await mcp.listTools();

      const formattedTools: ChatCompletionTool[] = tools.map(
        ({ name, description, inputSchema }) => ({
          type: "function",
          function: {
            name,
            description,
            parameters: inputSchema,
          },
        })
      );

      this.clients[name] = { mcp, transport, tools: formattedTools };

      console.log(`✅ Connected to "${name}" with tools: ${formattedTools.map(t => t.function.name).join(", ")}`);
    }
  }

  private getAllTools(): ChatCompletionTool[] {
    return Object.values(this.clients).flatMap(({ tools }) => tools);
  }

  private getClientByToolName(toolName: string): Client | undefined {
    for (const { mcp, tools } of Object.values(this.clients)) {
      if (tools.some(t => t.function.name === toolName)) return mcp;
    }
  }

  async processQuery(query: string): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: "user", content: query },
      ];

      const tools = this.getAllTools();

      console.log(`🤖 Sending query to OpenAI with ${tools.length} tools`);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools,
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      const toolCall = choice.message.tool_calls?.[0];
      const finalText: string[] = [];

      if (toolCall) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || "{}");

        console.log(`🔧 Tool call detected: ${toolName} with args:`, args);

        const mcp = this.getClientByToolName(toolName);
        if (!mcp) {
          throw new Error(`No client found for tool ${toolName}`);
        }

        const result = await mcp.callTool({
          name: toolName,
          arguments: args,
        });

        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(args)}]`
        );

        messages.push(
          choice.message,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: result.content as string,
          }
        );

        const followUp = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages,
        });

        finalText.push(followUp.choices[0].message.content || "");
      } else {
        finalText.push(choice.message.content || "");
      }

      return finalText.join("\n");
    } catch (err) {
      console.error("❌ processQuery error:", err);
      return `Error: ${err}`;
    }
  }

  async cleanupAll() {
    for (const { mcp } of Object.values(this.clients)) {
      await mcp.close();
    }
  }
}
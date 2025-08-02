import OpenAI from "openai";
import { ChatCompletion, ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionTool } from "openai/resources";
import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { IMCPClient, IAIProvider } from "../../interface.js";

import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;
  private mcpClient: IMCPClient;
  private model: string;

  constructor(mcpClient: IMCPClient, model: string) {
    this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    this.mcpClient = mcpClient;
    this.model = model;
  }

  buildContext(userQuery: string, context: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
    return [
      ...context,
      { role: "user", content: userQuery },
    ];
  }

  convertTools(tools: Tool[]): ChatCompletionTool[] {
    return tools.map(
      ({ name, description, inputSchema }) => ({
        type: "function",
        function: {
          name,
          description,
          parameters: inputSchema,
        },
      })
    );
  }

  async executeTool(toolCall: ChatCompletionMessageToolCall): Promise<CallToolResult> {
    const toolName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments || "{}");

    console.log(`🔧 Tool call detected: ${toolName} with args:`, args);

    const mcp = this.mcpClient.getClient(toolName);
    if (!mcp) {
      throw new Error(`No client found for tool ${toolName}`);
    }

    const result = await mcp.callTool({
      name: toolName,
      arguments: args,
    });

    return {
      content: result.content || [],
      isError: result.isError || false,
      _meta: result._meta || {}
    } as CallToolResult;
  }

  async chat(context: ChatCompletionMessageParam[]): Promise<ChatCompletion> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: context as ChatCompletionMessageParam[],
      tools: this.convertTools(this.mcpClient.listTools()),
      tool_choice: "auto",
    });
    return response;
  }

  async ask(query: string): Promise<string> {
    try {
      const messages = this.buildContext(query, []);

      const response = await this.chat(messages);

      const choice = response.choices[0];
      const toolCall = choice.message.tool_calls?.[0];
      const finalText: string[] = [];

      if (toolCall) {
        const result = await this.executeTool(toolCall);


        messages.push(
          choice.message,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          }
        );

        const followUp = await this.chat(messages);

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

}
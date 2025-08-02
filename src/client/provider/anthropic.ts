import { Anthropic } from '@anthropic-ai/sdk';
import {
  MessageParam,
  Tool as AnthropicTool,
  ToolUseBlock,
  TextBlock,
  Message
} from '@anthropic-ai/sdk/resources/messages';
import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { IMCPClient, IAIProvider } from '../../interface.js';

import dotenv from "dotenv";
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY as string;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

export class AnthropicProvider implements IAIProvider {
  private anthropic: Anthropic;
  private mcpClient: IMCPClient;
  private model: string;

  constructor(mcpClient: IMCPClient, model: string) {
    this.anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    this.mcpClient = mcpClient;
    this.model = model;
  }

  buildContext(userQuery: string, context: MessageParam[]): MessageParam[] {
    return [
      ...context,
      { role: "user", content: userQuery },
    ];
  }

  convertTools(tools: Tool[]): AnthropicTool[] {
    return tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      input_schema: inputSchema,
    }));
  }

  async executeTool(toolUse: ToolUseBlock): Promise<CallToolResult> {
    const toolName = toolUse.name;
    const args = toolUse.input || {};

    console.log(`🔧 Tool call detected: ${toolName} with args:`, args);

    const mcp = this.mcpClient.getClient(toolName);
    if (!mcp) {
      throw new Error(`No client found for tool ${toolName}`);
    }

    const result = await mcp.callTool({
      name: toolName,
      arguments: args as { [x: string]: unknown; },
    });

    return {
      content: result.content || [],
      isError: result.isError || false,
      _meta: result._meta || {}
    } as CallToolResult;
  }

  async chat(context: MessageParam[]): Promise<Message> {
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: context,
      tools: this.convertTools(this.mcpClient.listTools()),
    });
    return response;
  }


  async ask(query: string): Promise<string> {
    try {
      const messages = this.buildContext(query, []);

      const response = await this.chat(messages);

      const finalText: string[] = [];

      // Check if there are tool uses in the response
      const toolUses = response.content.filter(
        (block): block is ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUses.length > 0) {
        // Add the assistant's message to context
        messages.push({
          role: "assistant",
          content: response.content,
        });

        // Process each tool use
        const toolResults = await Promise.all(
          toolUses.map(async (toolUse) => {
            const result = await this.executeTool(toolUse);
            return {
              type: "tool_result" as const,
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            };
          })
        );

        // Add tool results to context
        messages.push({
          role: "user",
          content: toolResults,
        });

        // Get follow-up response
        const followUp = await this.chat(messages);

        // Extract text content from follow-up response
        const textBlocks = followUp.content.filter(
          (block): block is TextBlock => block.type === 'text'
        );

        finalText.push(...textBlocks.map(block => block.text));
      } else {
        // No tool use, extract text content directly
        const textBlocks = response.content.filter(
          (block): block is TextBlock => block.type === 'text'
        );

        finalText.push(...textBlocks.map(block => block.text));
      }

      return finalText.join("\n");
    } catch (err) {
      console.error("❌ processQuery error:", err);
      return `Error: ${err}`;
    }
  }
}

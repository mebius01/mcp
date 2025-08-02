import {
  GoogleGenerativeAI,
  Tool as GoogleTool,
  FunctionDeclaration,
  Part,
  FunctionCall,
  GenerateContentResponse,
} from "@google/generative-ai";
import { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  GenerativeContent,
  IAIProvider,
  IMCPClient,
  TContext,
  TToolCall,
  TAiCompletion
} from "../../interface.js";

import dotenv from "dotenv";
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set");
}


export type GeminiContext = GenerativeContent[];


export class GeminiProvider implements IAIProvider {
  private genAI: GoogleGenerativeAI;
  private mcpClient: IMCPClient;
  private model: string;

  constructor(mcpClient: IMCPClient, model: string) {
    this.genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    this.mcpClient = mcpClient;
    this.model = model;
  }

  buildContext(userQuery: string, context: TContext[]): TContext[] {
    const geminiContext: GeminiContext = context as GeminiContext;
    return [
      ...geminiContext,
      {
        role: "user",
        parts: [{ text: userQuery }],
      },
    ] as TContext[];
  }

  async executeTool(toolCall: FunctionCall): Promise<CallToolResult> {
    const toolName = toolCall.name;
    const args = toolCall.args;

    console.log(`🔧 Tool call detected: ${toolName} with args:`, args);

    const mcp = this.mcpClient.getClient(toolName);
    if (!mcp) {
      throw new Error(`No client found for tool ${toolName}`);
    }

    const result = await mcp.callTool({
      name: toolName,
      arguments: args as { [key: string]: unknown; },
    });

    return {
      content: result.content || [],
      isError: result.isError || false,
      _meta: result._meta || {},
    } as CallToolResult;
  }

  convertTools(tools: Tool[]): GoogleTool[] {
    return tools.map(({ name, description, inputSchema }) => ({
      functionDeclarations: [
        {
          name,
          description,
          parametersJsonSchema: inputSchema,
        },
      ],
    }));
  }

  async chat(context: TContext[]): Promise<TAiCompletion> {
    // 2. Ініціалізуємо модель, передаючи інструменти в правильному форматі
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      tools: this.convertTools(this.mcpClient.listTools()),
    });

    // 3. Інша логіка залишається без змін
    const chatSession = model.startChat({
      history: context as GenerativeContent[],
    });

    const lastMessage = context[context.length - 1] as GenerativeContent;
    const response = await chatSession.sendMessage(lastMessage.parts);

    return response.response as TAiCompletion;
  }

  async ask(query: string): Promise<string> {
    try {
      // Initialize model with tools
      const model = this.genAI.getGenerativeModel({
        model: this.model,
        tools: this.convertTools(this.mcpClient.listTools()),
      });

      // Start chat session
      const chatSession = model.startChat({
        history: [],
      });

      // Send initial message
      const response = await chatSession.sendMessage(query);
      const geminiResponse = response.response;

      // Extract function calls from parts
      const functionCalls = geminiResponse.candidates?.[0]?.content?.parts?.filter(
        (part): part is { functionCall: FunctionCall; } => !!part.functionCall
      )?.map(part => part.functionCall) || [];

      const finalText: string[] = [];

      if (functionCalls.length > 0) {
        console.log(`🔧 Executing ${functionCalls.length} function calls`);

        // Execute all function calls and prepare responses
        const functionResponses: Part[] = [];

        for (const functionCall of functionCalls) {
          try {
            const result = await this.executeTool(functionCall);

            // Format the result content properly for Google's API
            let formattedResult: any;
            if (Array.isArray(result.content) && result.content.length > 0) {
              // Extract text content from the array
              const textContent = result.content
                .filter((item: any) => item.type === 'text')
                .map((item: any) => item.text)
                .join('\n');
              formattedResult = textContent || JSON.stringify(result.content);
            } else {
              // If result.content is a string (likely JSON), try to parse it
              let parsedContent = result.content;
              if (typeof result.content === 'string') {
                try {
                  parsedContent = JSON.parse(result.content);
                } catch (e) {
                  // If parsing fails, use the string directly
                  parsedContent = result.content;
                }
              }
              formattedResult = parsedContent || {};
            }

            functionResponses.push({
              functionResponse: {
                name: functionCall.name,
                response: formattedResult,
              },
            });
          } catch (error) {
            console.error(`❌ Error executing tool ${functionCall.name}:`, error);
            functionResponses.push({
              functionResponse: {
                name: functionCall.name,
                response: {
                  error: `Failed to execute: ${error}`,
                  success: false
                },
              },
            });
          }
        }

        // Send function responses back to get final answer
        const followUpResponse = await chatSession.sendMessage(functionResponses);

        // Extract text content from follow-up response
        const textContent = followUpResponse.response.candidates?.[0]?.content?.parts
          ?.filter((part): part is { text: string; } => !!part.text)
          ?.map(part => part.text) || [];
        finalText.push(...textContent);
      } else {
        // Extract text content from initial response
        const textContent = geminiResponse.candidates?.[0]?.content?.parts
          ?.filter((part): part is { text: string; } => !!part.text)
          ?.map(part => part.text) || [];
        finalText.push(...textContent);
      }

      return finalText.join("\n");
    } catch (err) {
      console.error("❌ processQuery error:", err);
      return `Error: ${err}`;
    }
  }
}
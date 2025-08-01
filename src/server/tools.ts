import { ServerNotification, ServerRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { z, ZodRawShape } from "zod";
import { IMCPTool } from "../interface.js";


const formatResponse = (data: any): CallToolResult => ({
  content: [{
    type: "text",
    text: JSON.stringify(data, null, 2),
    _meta: {},
  }],
});

// Convert JSON Schema properties to Zod schema
const createZodSchema = (properties: Record<string, any>, required: string[] = []): ZodRawShape => {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    let zodType: z.ZodTypeAny;

    switch (prop.type) {
      case 'string':
        zodType = z.string();
        break;
      case 'number':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      case 'array':
        zodType = z.array(z.any());
        break;
      default:
        zodType = z.any();
    }

    shape[key] = required.includes(key) ? zodType : zodType.optional();
  }

  return shape as ZodRawShape;
};


// Converted tools ready for MCP server
export const TOOLS: IMCPTool[] = [
  {
    name: "ping-pong",
    description: "Responds with 'PONG' when you send 'PING', or echoes other messages",
    inputSchema: createZodSchema({
      properties: {
        message: {
          type: "string",
          description: "Message to send. Use 'PING' to get 'PONG' response."
        },
      },
      required: ["message"],
    }),
    callback: async (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
      const { message } = args as { message: string; };

      // Ping-Pong logic
      if (message.toUpperCase().trim() === "PING") {
        return formatResponse({
          response: "PONG",
          timestamp: new Date().toISOString(),
          message: "Server is alive and responding!"
        });
      }

      // Echo other messages
      return formatResponse({
        echo: message,
        note: "Send 'PING' to get 'PONG' response"
      });
    }
  },
  {
    name: "plus_numbers",
    description: "Add two numbers",
    inputSchema: createZodSchema({
      properties: {
        a: {
          type: "number",
          description: "The first number to add.",
        },
        b: {
          type: "number",
          description: "The second number to add.",
        },
      },
      required: ["a", "b"],
    }),
    callback: async (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
      const { a, b } = args as { a: number; b: number; };
      return formatResponse({ plus_numbers: { a, b, result: a + b } });
    }
  },
];

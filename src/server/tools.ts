import { ServerNotification, ServerRequest, Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";
import { IMCPTool } from "./interface.js";


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



// Helper function to create MCP tool with automatic schema conversion
const createMCPTool = (
  name: string,
  description: string,
  jsonSchema: { properties: Record<string, any>; required?: string[]; },
  callback: ToolCallback<ZodRawShape>
): IMCPTool => ({
  name,
  description,
  inputSchema: createZodSchema(jsonSchema.properties, jsonSchema.required || []),
  callback
});

// Converted tools ready for MCP server
export const TOOLS: IMCPTool[] = [
  createMCPTool(
    "echo",
    "Returns the input back as a stringified JSON",
    {
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
    async (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
      const { message } = args as { message: string; };
      return formatResponse({ echo: message });
    }
  ),
  createMCPTool(
    "plus_numbers",
    "Add two numbers",
    {
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
    },
    async (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
      const { a, b } = args as { a: number; b: number; };
      return formatResponse({ plus_numbers: { a, b, result: a + b } });
    }
  ),
];

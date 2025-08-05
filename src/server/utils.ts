import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z, ZodRawShape } from "zod";

/**
 * Converts JSON Schema properties to Zod schema shape for MCP tool/prompt validation.
 * 
 * @param properties - Object containing property definitions with type and description
 * @param required - Array of property names that are required (optional parameters will be marked as optional in Zod)
 * @returns ZodRawShape object that can be used with z.object() for validation
 * 
 * @example
 * ```typescript
 * const schema = createZodSchema(
 *   {
 *     name: { type: 'string', description: 'User name' },
 *     age: { type: 'number', description: 'User age' }
 *   },
 *   ['name'] // name is required, age is optional
 * );
 * ```
 */
export function createZodSchema(properties: Record<string, any>, required: string[] = []): ZodRawShape {
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
}

/**
 * Formats data into MCP-compliant CallToolResult format.
 * 
 * @param data - Any data to be formatted and returned as tool result
 * @returns CallToolResult with JSON-stringified data in text content
 * 
 * @example
 * ```typescript
 * const result = formatResponse({ message: "Hello World" });
 * // Returns: { content: [{ type: "text", text: "{\n  \"message\": \"Hello World\"\n}", _meta: {} }] }
 * ```
 */
export function formatResponse(data: any): CallToolResult {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(data, null, 2),
      _meta: {},
    }],
  };
}
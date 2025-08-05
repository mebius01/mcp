import { ServerNotification, ServerRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { z, ZodRawShape } from "zod";
import { IMCPTool, ProviderName } from "../interface.js";
import { DEFAULT_PROVIDER, MODELS } from "../config.js";

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


export const TOOLS: IMCPTool[] = [
  {
    name: "list-models",
    description: "Returns a list of all available models grouped by provider",
    inputSchema: createZodSchema({
      properties: {},
      required: [],
    }),
    callback: async (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
      const models: Record<string, string[]> = {};
      MODELS.forEach((model) => {
        if (!models[model.provider]) {
          models[model.provider] = [];
        }
        models[model.provider].push(model.model_code);
      });
      return formatResponse(models);
    }
  },
  {
    name: "show-model",
    description: "Returns the current provider and model configuration",
    inputSchema: createZodSchema({
      properties: {},
      required: [],
    }),
    callback: async (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
      const data = {
        provider: DEFAULT_PROVIDER.provider as ProviderName,
        model: DEFAULT_PROVIDER.model,
      };
      return formatResponse(data);
    }
  }
];

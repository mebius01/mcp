import { ServerNotification, ServerRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { IMCPTool, ProviderName } from "../../interface.js";
import { MODELS, DEFAULT_PROVIDER } from "../../config.js";
import { createZodSchema, formatResponse } from "../utils.js";

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

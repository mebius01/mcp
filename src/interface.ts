import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodRawShape } from 'zod';
import { Tool, CallToolResult, GetPromptResult, ReadResourceResult, ServerRequest, ServerNotification, Prompt, Resource } from '@modelcontextprotocol/sdk/types.js';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool
} from "openai/resources";

import {
  MessageParam,
  Tool as AnthropicTool,
  ToolUseBlock,
  Message
} from '@anthropic-ai/sdk/resources/messages';

import {
  GenerateContentResponse,
  Part,
  FunctionCall,
  Tool as GoogleTool,
} from "@google/generative-ai";
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

export interface IMCPTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema: ZodRawShape;
  callback: ToolCallback<ZodRawShape>;
}

export interface IMCPPrompt {
  name: string;
  description: string;
  argsSchema: ZodRawShape;
  callback: (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<GetPromptResult>;
}

export interface IMCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  callback: (args: any, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<ReadResourceResult>;
}

export type MCPServerConfig = {
  command: string;
  args?: string[];
  env?: Record<string, string>;
};

export type ProviderName = 'openai' | 'google' | 'anthropic';

export type IModel = {
  model_id: number;
  provider: ProviderName;
  model_name: string;
  model_code: string;
  notes?: string;
};

export interface IMCPClient {
  connect(configs: Record<string, MCPServerConfig>): Promise<void>;
  disconnect(): Promise<void>;
  listTools(): Tool[];
  listPrompts(): Prompt[];
  listResources(): Resource[];
  getClient(toolName: string): Client | undefined;
}

export type GenerativeContent = {
  role: string;
  parts: Part[];
};

// Універсальний тип для контексту повідомлень, що включає всі платформи
export type TContext =
  | ChatCompletionMessageParam
  | MessageParam
  | GenerativeContent;

// Універсальний тип для опису інструменту, що включає всі платформи
export type TTool = ChatCompletionTool | AnthropicTool | GoogleTool;

// Універсальний тип для повної відповіді від AI, що включає всі платформи
export type TAiCompletion = ChatCompletion | Message | GenerateContentResponse;

// Універсальний тип для виклику інструменту, що включає всі платформи
export type TToolCall =
  | ChatCompletionMessageToolCall
  | ToolUseBlock
  | FunctionCall;

// Універсальний інтерфейс для провайдера AI
export interface IAIProvider {
  ask(query: string): Promise<string>;
  buildContext(userQuery: string, context: TContext[]): TContext[];
  convertTools(tools: Tool[]): TTool[];
  executeTool(toolCall: TToolCall): Promise<CallToolResult>;
  chat(context: TContext[]): Promise<TAiCompletion>;
}
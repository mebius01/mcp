import { IModel, MCPServerConfig } from "./interface.js";
import dotenv from "dotenv";
dotenv.config();

export const MCP_SERVER_CONFIG: Record<string, MCPServerConfig> = {
  notion: {
    command: "npx",
    args: ["-y", "@notionhq/notion-mcp-server"],
    env: {
      OPENAPI_MCP_HEADERS: `{\"Authorization\": \"Bearer ${process.env.NOTION_API_KEY}\", \"Notion-Version\": \"2022-06-28\" }`,
    },
  },
  github: {
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "-e",
      "GITHUB_PERSONAL_ACCESS_TOKEN",
      "ghcr.io/github/github-mcp-server"
    ],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || "",
    },
  },
  local: {
    command: "node",
    args: ["build/server/main.js"],
  },
};

export const MODELS: IModel[] = [
  // OpenAI models
  {
    model_id: 1,
    provider: 'openai',
    model_name: 'GPT-4O',
    model_code: 'gpt-4o',
  },
  {
    model_id: 2,
    provider: 'openai',
    model_name: 'GPT-3.5 Turbo',
    model_code: 'gpt-3.5-turbo',
  },

  // Google models
  {
    model_id: 3,
    provider: 'google',
    model_name: 'Gemini 2.0 Flash',
    model_code: 'gemini-2.0-flash',
  },
  {
    model_id: 4,
    provider: 'google',
    model_name: 'Gemini 1.5 Pro',
    model_code: 'gemini-1.5-pro',
  },

  // Anthropic models
  {
    model_id: 5,
    provider: 'anthropic',
    model_name: 'Claude 3.5 Sonnet',
    model_code: 'claude-3-5-sonnet-20241022',
  },
  {
    model_id: 6,
    provider: 'anthropic',
    model_name: 'Claude 3 Opus',
    model_code: 'claude-3-opus-20240229',
  },
];

export const DEFAULT_PROVIDER = {
  provider: "openai",
  model: "gpt-4o",
};
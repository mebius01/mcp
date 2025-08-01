import dotenv from "dotenv";
import { MCPServerConfig } from "../interface.js";
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
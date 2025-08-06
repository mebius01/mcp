import { IMCPResource } from "../../interface.js";

export const RESOURCES: IMCPResource[] = [
  {
    name: "server-config",
    uri: "config://mcp-server",
    description: "Server configuration and status information",
    mimeType: "application/json",
    callback: async (args, extra) => {
      const config = {
        name: "local-mcp-server",
        version: "1.0.0",
        status: "running",
        capabilities: ["tools", "prompts", "resources"],
        timestamp: new Date().toISOString()
      };

      return {
        contents: [
          {
            uri: "config://mcp-server",
            text: JSON.stringify(config, null, 2),
            mimeType: "application/json"
          }
        ]
      };
    }
  },
  {
    name: "api-docs",
    uri: "docs://mcp-api",
    description: "Complete API documentation",
    mimeType: "text/markdown",
    callback: async (args, extra) => {
      const docs = `# MCP Server API Documentation

## Available Tools
- list-models: Get all available AI models
- show-model: Get currently selected model

## Available Prompts
- code-review: Generate code review prompts
- explain-concept: Educational explanations
- debug-helper: Debugging assistance

## Available Resources
- config://mcp-server: Server configuration
- docs://mcp-api: This documentation
- logs://mcp-server: Server logs

## Usage
Connect to this MCP server using any MCP-compatible client.
`;

      return {
        contents: [
          {
            uri: "docs://mcp-api",
            text: docs,
            mimeType: "text/markdown"
          }
        ]
      };
    }
  },
  {
    name: "server-logs",
    uri: "logs://mcp-server",
    description: "Server logs and debugging information",
    mimeType: "text/plain",
    callback: async (args, extra) => {
      const logs = `[${new Date().toISOString()}] MCP Server started
[${new Date().toISOString()}] Tools registered: 2
[${new Date().toISOString()}] Prompts registered: 3
[${new Date().toISOString()}] Resources registered: 3
[${new Date().toISOString()}] Server ready for connections
`;

      return {
        contents: [
          {
            uri: "logs://mcp-server",
            text: logs,
            mimeType: "text/plain"
          }
        ]
      };
    }
  }
];
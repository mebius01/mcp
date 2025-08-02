import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TOOLS } from "./tools.js";

async function main() {
  const transport = new StdioServerTransport();
  const server = new McpServer({
    name: "notion-mcp-server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: TOOLS,
    },
  });

  for (const tool of TOOLS) {
    server.registerTool(tool.name, {
      title: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    },
      tool.callback
    );
  }

  await server.connect(transport);
}

main().catch((err) => {
  console.error("❌ MCP server failed:", err);
  process.exit(1);
});


import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProviderName } from "../interface.js";

export async function updateTmpFile(provider: ProviderName, model: string): Promise<void> {
  const filePath = path.join(__dirname, '.tmp');
  try {
    let lines: string[] = [];

    try {
      // Try to read existing file
      const content = await fs.readFile(filePath, 'utf-8');
      lines = content.split('\n');
    } catch {
      // File doesn't exist, initialize with empty content
      lines = [];
    }

    let hasProvider = false;
    let hasModel = false;

    const updatedLines = lines.map(line => {
      if (line.startsWith('provider=')) {
        hasProvider = true;
        return `provider=${provider}`;
      }
      if (line.startsWith('model=')) {
        hasModel = true;
        return `model=${model}`;
      }
      return line;
    });

    if (!hasProvider) updatedLines.push(`provider=${provider}`);
    if (!hasModel) updatedLines.push(`model=${model}`);

    await fs.writeFile(filePath, updatedLines.join('\n'), 'utf-8');
    console.log('✅ File created or updated');
  } catch (error) {
    console.error('❌ Failed to create/update file:', error);
    throw error;
  }
}


async function readTmpFile(): Promise<{ provider: ProviderName; model: string; }> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, '.tmp');
  const defaultConfig = { provider: 'openai' as ProviderName, model: 'gpt-4o' };

  try {
    await fs.access(filePath);

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n');

    let provider: ProviderName = defaultConfig.provider;
    let model: string = defaultConfig.model;

    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key === 'provider' && value && ['openai', 'anthropic', 'gemini'].includes(value)) {
        provider = value as ProviderName;
      } else if (key === 'model' && value) {
        model = value;
      }
    }

    return { provider, model };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`⚠️ File not found: ${filePath} Using default config:`, defaultConfig);
      return defaultConfig;
    }
    console.error(`❌ Failed to read file ${filePath}:`, error);
    throw error;
  }
}

export { readTmpFile };

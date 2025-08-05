import { MCPClient } from "./client/client.js";
import { MCP_SERVER_CONFIG } from "./config.js";
import { chat } from "./client/chat.js";

const mcpClient = new MCPClient();

async function main() {
  try {
    await mcpClient.connect(MCP_SERVER_CONFIG);
    await chat(mcpClient);
  } finally {
    await mcpClient.disconnect();
    process.exit(0);
  }
}

main();
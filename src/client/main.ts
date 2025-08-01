import readline from "readline/promises";
import { MCPClient } from "./client.js";
import { MCP_SERVER_CONFIG } from "./config.js";



const mcpClient = new MCPClient();

async function chat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("\nMCP Client Started!");
    console.log("Type your queries or 'quit' to exit.");

    while (true) {
      try {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") {
          break;
        }

        console.log(`💬 Processing: "${message}"`);
        const response = await mcpClient.processQuery(message);
        console.log("\n" + response);
      } catch (queryError) {
        console.error(`❌ Error processing query:`, queryError);
        console.log(`\nError: ${queryError}`);
        console.log("Please try again or type 'quit' to exit.");
      }
    }
  } catch (error) {
    console.error(`❌ Fatal error in chat loop:`, error);
  } finally {
    rl.close();
  }
}



async function main() {
  try {
    await mcpClient.connectAll(MCP_SERVER_CONFIG);
    await chat();
  } finally {
    await mcpClient.cleanupAll();
    process.exit(0);
  }
}
main();
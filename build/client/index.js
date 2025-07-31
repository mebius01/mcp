import readline from "readline/promises";
import { MCPClient } from "./client.js";
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
            }
            catch (queryError) {
                console.error(`❌ Error processing query:`, queryError);
                console.log(`\nError: ${queryError}`);
                console.log("Please try again or type 'quit' to exit.");
            }
        }
    }
    catch (error) {
        console.error(`❌ Fatal error in chat loop:`, error);
    }
    finally {
        rl.close();
    }
}
async function main() {
    if (process.argv.length < 3) {
        console.log("Usage: node index.ts <path_to_server_script>");
        return;
    }
    try {
        await mcpClient.connectToServer(process.argv[2]);
        await chat();
    }
    finally {
        await mcpClient.cleanup();
        process.exit(0);
    }
}
main();

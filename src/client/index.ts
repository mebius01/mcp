import readline from "readline/promises";
import { MCPClient } from "./client.js";
import dotenv from "dotenv";
dotenv.config();
console.log({ NOTION_API_KEY: process.env.NOTION_API_KEY, GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });
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

export const mcpConfigs = {
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
    args: ["build/server/index.js"],
  },
};


async function main() {
  try {
    await mcpClient.connectAll(mcpConfigs);
    await chat();
  } finally {
    await mcpClient.cleanupAll();
    process.exit(0);
  }
}
main();
import readline from "readline/promises";
import { MCPClient } from "./client.js";
import { DEFAULT_PROVIDER, MCP_SERVER_CONFIG } from "../config.js";
import { OpenAIProvider } from "./provider/openai.js";
import { IAIProvider } from "../interface.js";
import { GeminiProvider } from "./provider/google.js";
import { AnthropicProvider } from "./provider/anthropic.js";


const mcpClient = new MCPClient();

async function getProvider(): Promise<IAIProvider> {
  const { provider, model } = DEFAULT_PROVIDER;

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(mcpClient, model);
    case 'google':
      return new GeminiProvider(mcpClient, model);
    case 'anthropic':
      return new AnthropicProvider(mcpClient, model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
const aiProvider = await getProvider();

async function chat() {
  const { provider, model } = DEFAULT_PROVIDER;
  console.log(`✨ Using provider: ${provider}, model: ${model}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      try {
        const message = await rl.question("\nQuery: ");
        const response = await aiProvider.ask(message);
        console.log("\n" + response);
      } catch (queryError) {
        console.error(`❌ Error processing query:`, queryError);
        console.log(`\nError: ${queryError}`);
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
    await mcpClient.connect(MCP_SERVER_CONFIG);
    await chat();
  } finally {
    await mcpClient.disconnect();
    process.exit(0);
  }
}
main();
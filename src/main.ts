import readline from "readline/promises";
import { MCPClient } from "./client/client.js";
import { DEFAULT_PROVIDER, MCP_SERVER_CONFIG, MODELS } from "./config.js";
import { OpenAIProvider } from "./client/provider/openai.js";
import { IAIProvider, ProviderName } from "./interface.js";
import { GeminiProvider } from "./client/provider/google.js";
import { AnthropicProvider } from "./client/provider/anthropic.js";


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

async function chat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      try {
        const aiProvider = await getProvider();
        const message = await rl.question("Query: ");
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
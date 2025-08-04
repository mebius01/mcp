import { MCPClient } from "./client.js";
import { DEFAULT_PROVIDER } from "../config.js";
import { IAIProvider } from "../interface.js";
import { AnthropicProvider } from "./provider/anthropic.js";
import { GeminiProvider } from "./provider/google.js";
import { OpenAIProvider } from "./provider/openai.js";
import readline from "readline/promises";

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

export async function chat() {
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
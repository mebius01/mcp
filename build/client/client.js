import OpenAI from "openai";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
}
export class MCPClient {
    mcp;
    openai;
    transport = null;
    tools = [];
    constructor() {
        this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    }
    async connectToServer(serverScriptPath) {
        const isJs = serverScriptPath.endsWith(".js");
        if (!isJs) {
            throw new Error("Server script must be a .js file");
        }
        const command = process.execPath;
        try {
            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            await this.mcp.connect(this.transport);
            const { tools } = await this.mcp.listTools();
            this.tools = tools.map(({ name, description, inputSchema }) => ({
                type: "function",
                function: {
                    name,
                    description,
                    parameters: inputSchema,
                },
            }));
            console.log("✅ Connected to server with tools:", this.tools.map(({ function: { name } }) => name).join(", "));
        }
        catch (error) {
            console.error("❌ Failed to connect to MCP server:", error);
            throw error;
        }
    }
    async processQuery(query) {
        try {
            console.log(`🔍 Processing query: "${query}"`);
            const messages = [
                {
                    role: "user",
                    content: query,
                },
            ];
            console.log(`🤖 Calling OpenAI with ${this.tools.length} tools available`);
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // або іншу модель
                messages,
                tools: this.tools,
                tool_choice: "auto",
            });
            console.log(`✅ OpenAI response received`);
            const finalText = [];
            const choice = response.choices[0];
            const toolCall = choice.message.tool_calls?.[0];
            if (toolCall) {
                console.log(`🔧 Tool call detected: ${toolCall.function.name}`);
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
                console.log(`📥 Tool args:`, toolArgs);
                try {
                    const result = await this.mcp.callTool({
                        name: toolName,
                        arguments: toolArgs,
                    });
                    console.log(`✅ Tool call successful`);
                    finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`);
                    messages.push(choice.message, {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result.content,
                    });
                    console.log(`🤖 Getting follow-up response from OpenAI`);
                    const followUp = await this.openai.chat.completions.create({
                        model: "gpt-4o",
                        messages,
                    });
                    finalText.push(followUp.choices[0].message.content || "");
                }
                catch (toolError) {
                    console.error(`❌ Tool call failed:`, toolError);
                    finalText.push(`Error calling tool ${toolName}: ${toolError}`);
                }
            }
            else {
                console.log(`💬 No tool call, using direct response`);
                finalText.push(choice.message.content || "");
            }
            return finalText.join("\n");
        }
        catch (error) {
            console.error(`❌ Error in processQuery:`, error);
            return `Error processing query: ${error}`;
        }
    }
    async cleanup() {
        await this.mcp.close();
    }
}

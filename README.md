# MCP-HUB

**MCP-HUB** is a comprehensive multi-provider Model Context Protocol (MCP) client that enables seamless integration with various AI services (OpenAI, Google, Anthropic) and MCP servers (Notion, GitHub, local) through a unified TypeScript chat interface.

## 🚀 Key Features

- **Universal MCP Client**: Connect to any MCP-compatible server with unified interface
- **Multi-AI Provider Support**: OpenAI GPT, Google Gemini, Anthropic Claude with easy switching
- **Complete MCP Protocol**: Full implementation of Tools, Prompts, and Resources specifications
- **Type-Safe Architecture**: Full TypeScript support with Zod validation and proper interfaces
- **Plug-and-Play Integration**: Easy connection to Notion, GitHub, and custom MCP servers
- **Interactive Development**: CLI interface for testing and development workflows
- **Enterprise-Grade**: Robust error handling, logging, and configuration management

## 🏗️ Architecture

The project consists of three main components:

### 📡 MCP Client (`src/client/`)
- **Multi-Provider Support**: Adapters for OpenAI, Google Gemini, Anthropic Claude
- **MCP Protocol**: Standard MCP client implementation for server connections
- **Chat Interface**: Interactive chat logic with AI providers
- **Provider Abstraction**: Unified interface for different AI models

### 🛠️ MCP Server (`src/server/`)
- **Local MCP Server**: Custom tools and functions implementation
- **Tool Registration**: MCP-compliant tool definitions
- **Prompt Registration**: MCP-compliant prompt definitions
- **Resource Registration**: MCP-compliant resource definitions
- **Type Safety**: Full TypeScript support with proper interfaces

### ⚙️ Core Components (`src/`)
- **Centralized Configuration**: Single config file for all servers and models
- **Type Definitions**: Shared interfaces and types across the project
- **Main Entry Point**: Application bootstrap and initialization

## 📋 Prerequisites

- Node.js 18+ 
- TypeScript 5.8+
- Docker (for GitHub server)
- API Keys for your chosen providers:
  - Notion Integration Token (for Notion server)
  - OpenAI API Key (for OpenAI provider)
  - Google AI API Key (for Gemini provider)
  - Anthropic API Key (for Claude provider)
  - GitHub Personal Access Token (for GitHub server)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone git@github.com:Halo-Lab/mcp-hub.git
cd mcp-hub
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
# MCP Server APIs
NOTION_API_KEY=your_notion_integration_token_here
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here

# AI Provider APIs (add only the ones you plan to use)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_ai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. **Build the project:**
```bash
npm run build
```

5. **Run the client:**
```bash
npm run start
```

## 🏗️ Project Structure

```
src/
├── main.ts                # Main application entry point
├── config.ts              # Centralized configuration for servers and models
├── interface.ts           # TypeScript interfaces and types
├── client/                # MCP Client implementation
│   ├── chat.ts           # Chat interaction logic
│   ├── client.ts         # MCP client logic
│   └── provider/         # AI provider implementations
│       ├── openai.ts     # OpenAI GPT integration
│       ├── google.ts     # Google Gemini integration
│       └── anthropic.ts  # Anthropic Claude integration
└── server/               # Local MCP Server
    ├── main.ts           # Server entry point
    ├── utils.ts          # Server utilities and helpers
    └── content/          # MCP server content definitions
        ├── tools.ts      # Custom MCP tools
        ├── prompts.ts    # MCP prompts for AI assistance
        └── resources.ts  # MCP resources (config, docs, logs)
```

## ⚙️ Configuration

### AI Providers and Models

The system supports multiple AI providers with various models. Configuration is centralized in `src/config.ts`:

```typescript
export const MODELS: IModel[] = [
  // OpenAI models
  { model_id: 1, provider: 'openai', model_name: 'GPT-4O', model_code: 'gpt-4o' },
  { model_id: 2, provider: 'openai', model_name: 'GPT-3.5 Turbo', model_code: 'gpt-3.5-turbo' },
  
  // Google models  
  { model_id: 3, provider: 'google', model_name: 'Gemini 2.0 Flash', model_code: 'gemini-2.0-flash' },
  { model_id: 4, provider: 'google', model_name: 'Gemini 1.5 Pro', model_code: 'gemini-1.5-pro' },
  
  // Anthropic models
  { model_id: 5, provider: 'anthropic', model_name: 'Claude 3.5 Sonnet', model_code: 'claude-3-5-sonnet-20241022' },
  { model_id: 6, provider: 'anthropic', model_name: 'Claude 3 Opus', model_code: 'claude-3-opus-20240229' },
];
```

### Changing AI Provider

To use a different AI provider, update the `DEFAULT_PROVIDER` in `src/config.ts`:

```typescript
export const DEFAULT_PROVIDER = {
  provider: "google",        // "openai", "google", or "anthropic"
  model: "gemini-2.0-flash", // Model code from MODELS array
};
```

### MCP Server Configuration

Each server configuration follows the MCP standard:

```typescript
interface MCPServerConfig {
  command: string;           // Executable command (node, npx, docker, etc.)
  args?: string[];          // Command arguments
  env?: Record<string, string>; // Environment variables
}

```

### Built-in Server Configurations

The system comes with pre-configured setups for popular MCP servers in `src/config.ts`:

#### Notion Server
```typescript
notion: {
  command: "npx",
  args: ["-y", "@notionhq/notion-mcp-server"],
  env: {
    OPENAPI_MCP_HEADERS: `{"Authorization": "Bearer ${NOTION_API_KEY}", "Notion-Version": "2022-06-28" }`
  }
}
```
- **Purpose**: Access Notion pages, databases, blocks, users, and comments
- **Standard**: Official Notion MCP server
- **Authentication**: Bearer token via OPENAPI_MCP_HEADERS

#### GitHub Server
```typescript
github: {
  command: "docker",
  args: [
    "run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
    "ghcr.io/github/github-mcp-server"
  ],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }
}
```
- **Purpose**: Manage repositories, issues, pull requests
- **Standard**: Official GitHub MCP server
- **Authentication**: Personal Access Token

#### Local Server
```typescript
local: {
  command: "node",
  args: ["build/server/main.js"]
}
```
- **Purpose**: Custom MCP server with local tools
- **Standard**: Built with MCP SDK
- **Authentication**: Uses environment variables as needed

### Adding New Servers

You can easily add any MCP server by adding it to the configuration in `src/config.ts`:

```typescript
export const MCP_SERVER_CONFIG = {
  // Built-in servers
  notion: { /* ... */ },
  github: { /* ... */ },
  local: { /* ... */ },
  
  // Add your custom server
  yourServer: {
    command: "npx",
    args: ["-y", "@your-org/your-mcp-server"],
    env: {
      YOUR_API_KEY: process.env.YOUR_API_KEY
    }
  }
};
```

## 🚀 Usage

### Interactive Chat

The client provides an interactive chat interface that connects to all configured MCP servers and uses your chosen AI provider:

```bash
npm run start
```

The system will:
1. Connect to all configured MCP servers
2. Initialize the AI provider (default: OpenAI GPT-4O)
3. Start an interactive chat session
4. Automatically use MCP tools when relevant to your queries

## 🛠️ Development

### Running the Local Server Only

To run just the local MCP server:

```bash
# Build first
npm run build

# Run server
node build/server/main.js
```

## 🧪 Testing with MCP Inspector

You can test the local MCP server using the official MCP Inspector tool:

1. **Install MCP Inspector globally:**
```bash
npm install -g @modelcontextprotocol/inspector
```

2. **Build and start your local server:**
```bash
npm run build
node build/server/main.js
```

3. **In another terminal, run MCP Inspector:**
```bash
mcp-inspector
```

The MCP Inspector provides a visual interface to:
- Browse available tools and their schemas
- Test tool execution with different parameters
- View server capabilities and metadata
- Debug MCP protocol communication

## 📚 Resources

- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI API Documentation](https://ai.google.dev/)
- [Anthropic API Documentation](https://docs.anthropic.com/)

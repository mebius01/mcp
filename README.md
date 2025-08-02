# MCP Client/Server

This is a comprehensive **Model Context Protocol (MCP)** implementation with multi-server support and AI provider integration.  
The project includes both a local MCP server and a client that can connect to multiple external MCP servers simultaneously (Notion, GitHub, local) with built-in configurations and support for multiple AI providers (OpenAI, Google Gemini, Anthropic Claude).

## ✨ Features

- **Multi-Server Support**: Connect to multiple MCP servers simultaneously
- **Multi-AI Provider**: Support for OpenAI, Google Gemini, and Anthropic Claude
- **Centralized Configuration**: Easy server and model configuration
- **Local MCP Server**: Built-in server with custom tools
- **TypeScript**: Full type safety and modern development experience
- **Flexible Architecture**: Easy to extend with new servers and providers

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
├── config.ts              # Centralized configuration for servers and models
├── interface.ts            # TypeScript interfaces and types
├── client/                 # MCP Client implementation
│   ├── main.ts            # Main client entry point
│   ├── client.ts          # MCP client logic
│   └── provider/          # AI provider implementations
│       ├── openai.ts      # OpenAI GPT integration
│       ├── google.ts      # Google Gemini integration
│       └── anthropic.ts   # Anthropic Claude integration
└── server/                 # Local MCP Server
    ├── main.ts            # Server entry point
    └── tools.ts           # Custom MCP tools
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

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Resources

- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI API Documentation](https://ai.google.dev/)
- [Anthropic API Documentation](https://docs.anthropic.com/)

# MCP-HUB
MCP-HUB is a powerful multi-server MCP client that allows you to seamlessly interact with various AI services and tools through a single chat interface. 
It combines the power of OpenAI's language models with multiple MCP servers, providing access to Notion, GitHub, and custom tools all in one place.


## 📋 Prerequisites

- Node.js 18+ 
- TypeScript 5.8+
- Docker (for GitHub server)
- Notion Integration Token
- OpenAI API Key (for client usage)
- GitHub Personal Access Token (for client usage)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone https://github.com/mebius01/mcp.git
```

2. **Install dependencies:**
```bash
npm install
   ```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
NOTION_API_KEY=your_notion_integration_token_here
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here
```

4. **Build the project:**
```bash
npm run build
```

5. **Run the server:**
```bash
npm run start
```


## 🔧 Server Configuration System

MCP-HUB features a flexible **server configuration system** that allows you to easily connect to any MCP-compatible server. The configuration follows the **Model Context Protocol (MCP) standard**, ensuring compatibility with the growing ecosystem of MCP servers.

### Configuration

Each server configuration follows this structure:
```typescript
interface MCPServerConfig {
  command: string;           // Executable command (node, npx, docker, etc.)
  args?: string[];          // Command arguments
  env?: Record<string, string>; // Environment variables
}
```

### Adding New Servers

You can easily add any MCP server by adding it to the configuration in `src/client/config.ts`:

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

### Built-in Configurations

MCP-HUB comes with pre-configured setups for popular MCP servers:

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
- **Purpose**: Custom MCP server with 18 Notion API tools
- **Standard**: Built with MCP SDK
- **Authentication**: Uses NOTION_API_KEY from environment



## 🏗️ Project Structure

```
mcp/
├── src/
│   ├── client/           # Multi-server MCP client
│   │   ├── client.ts     # Core MCP client with multi-server support
│   │   ├── config.ts     # Server configurations (Notion, GitHub, Local)
│   │   └── main.ts       # CLI entry point with interactive chat
│   ├── server/           # Local MCP server implementation
│   │   ├── main.ts       # Server entry point
│   │   └── tools.ts      # 18 Notion API tools with schema conversion
│   └── interface.ts      # Shared TypeScript interfaces (MCPServerConfig, IMCPTool)
├── build/                # Compiled JavaScript output
├── .env                  # Environment variables (Notion, OpenAI, GitHub)
├── .gitignore            # Git ignore rules
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

# MCP Client/Server

This is a comprehensive **Model Context Protocol (MCP)** implementation with multi-server support.  
The project includes both a local MCP server with 18 Notion API tools and a client that can connect to multiple external MCP servers simultaneously (Notion, GitHub, local) with built-in configurations.

## Goals
- Understand MCP architecture
- Learn how to create custom tools
- Use Zod for input validation

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

## 🏗️ Project Structure

```
mcp/
├── src/
│   ├── client/           # Multi-server MCP client
│   │   ├── client.ts     # Client with OpenAI integration & config support
│   │   └── index.ts      # CLI with built-in server configurations
│   └── server/           # Local MCP server implementation
│       ├── index.ts      # Main server entry point
│       ├── interface.ts  # TypeScript interfaces
│       └── tools.ts      # 18 Notion API tools with schema conversion
├── build/                # Compiled JavaScript output
├── mcp-config.example.json # Example configuration for external servers
├── .env                  # Environment variables (Notion, OpenAI, GitHub)
├── .gitignore           # Git ignore rules
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

# MCP-HUB
MCP-HUB is a powerful multi-server MCP client that allows you to seamlessly interact with various AI services and tools through a single chat interface. 
It combines the power of OpenAI's language models with multiple MCP servers, providing access to Notion, GitHub, and custom tools all in one place.


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
├── .env                  # Environment variables (Notion, OpenAI, GitHub)
├── .gitignore            # Git ignore rules
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

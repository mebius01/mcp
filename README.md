# MCP Client/Server

This is a pet project for learning how to work with the **Model Context Protocol (MCP)**.  
The server implements basic tools using the MCP SDK and handles requests via standard input/output (stdio).

## Goals
- Understand MCP architecture
- Learn how to create custom tools
- Use Zod for input validation

## 📋 Prerequisites

- Node.js 18+ 
- TypeScript 5.8+
- Notion Integration Token
- OpenAI API Key (for client usage)

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
│   ├── client/           # MCP client implementation
│   │   ├── client.ts     # Main client class with OpenAI integration
│   │   └── index.ts      # Interactive CLI interface
│   ├── common.ts         # Shared schemas and utilities
│   ├── execute.ts        # Notion API execution layer
│   ├── interface.ts      # TypeScript interfaces
│   ├── schemas.ts        # Tool schema definitions
│   ├── server.ts         # MCP server implementation
│   └── tool.ts           # Legacy tool definitions
├── build/                # Compiled JavaScript output
├── .env                  # Environment variables
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

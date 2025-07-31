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
│   └── server/           # MCP server implementation
│       ├── index.ts      # Main server entry point
│       ├── interface.ts  # TypeScript interfaces
│       └── tools.ts      # Tool definitions with schema conversion
├── build/                # Compiled JavaScript output
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodRawShape } from 'zod';

export interface IMCPTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema: ZodRawShape;
  callback: ToolCallback<ZodRawShape>;
}
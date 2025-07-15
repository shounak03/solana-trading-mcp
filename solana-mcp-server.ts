#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { getCurrentSolanaPrice, getSolBalance } from './index.js';

// Create MCP server
const server = new Server(
  {
    name: 'solana-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools that expose our Solana functions
const tools: Tool[] = [
  {
    name: 'getCurrentSolanaPrice',
    description: 'Fetches the current Solana (SOL) price in USD from CoinGecko API',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getSolBalance',
    description: 'Fetches the SOL balance for a given Solana public key',
    inputSchema: {
      type: 'object',
      properties: {
        publicKey: {
          type: 'string',
          description: 'The Solana public key as a string',
        },
      },
      required: ['publicKey'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'getCurrentSolanaPrice': {
        const price = await getCurrentSolanaPrice();
        return {
          content: [
            {
              type: 'text',
              text: `Current SOL price: $${price.toFixed(2)} USD`,
            },
          ],
        };
      }

      case 'getSolBalance': {
        const { publicKey } = args as { publicKey: string };
        if (!publicKey) {
          throw new Error('publicKey parameter is required');
        }
        
        const balance = await getSolBalance(publicKey);
        const price = await getCurrentSolanaPrice();
        const usdValue = balance * price;
        
        return {
          content: [
            {
              type: 'text',
              text: `SOL Balance: ${balance.toFixed(4)} SOL\nUSD Value: $${usdValue.toFixed(2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Solana MCP Server running on stdio');
}

if (import.meta.main) {
  main().catch(console.error);
} 
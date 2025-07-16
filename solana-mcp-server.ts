#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  getCurrentSolanaPrice, 
  getSolBalance, 
  connectWallet, 
  getConnectedWallet, 
  disconnectWallet, 
  buySolana, 
  sellSolana, 
  parseNaturalLanguageAmount 
} from './index.js';

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
  {
    name: 'connectWallet',
    description: 'Connect a Solana wallet using its public key. This allows you to perform buy/sell operations.',
    inputSchema: {
      type: 'object',
      properties: {
        publicKey: {
          type: 'string',
          description: 'The Solana wallet public key to connect',
        },
      },
      required: ['publicKey'],
    },
  },
  {
    name: 'getConnectedWallet',
    description: 'Get information about the currently connected wallet',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'disconnectWallet',
    description: 'Disconnect the currently connected wallet',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'buySolana',
    description: 'Buy Solana using USD. Supports natural language amounts like "$100", "50 USD", etc. Requires a connected wallet.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'string',
          description: 'Amount to spend in USD. Can be natural language like "$100" or "50 dollars"',
        },
      },
      required: ['amount'],
    },
  },
  {
    name: 'sellSolana',
    description: 'Sell Solana for USD. Supports natural language amounts like "1.5 SOL", "half my balance", "all my SOL", etc. Requires a connected wallet.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'string',
          description: 'Amount of SOL to sell. Can be natural language like "1.5 SOL", "half my balance", or "all"',
        },
      },
      required: ['amount'],
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
      
      case 'connectWallet': {
        const { publicKey } = args as { publicKey: string };
        if (!publicKey) {
          throw new Error('publicKey parameter is required');
        }
        
        const walletInfo = await connectWallet(publicKey);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Wallet connected successfully!\nPublic Key: ${walletInfo.publicKey}\nBalance: ${walletInfo.balance?.toFixed(4)} SOL`,
            },
          ],
        };
      }

      case 'getConnectedWallet': {
        const wallet = getConnectedWallet();
        if (!wallet) {
          return {
            content: [
              {
                type: 'text',
                text: 'No wallet currently connected. Use connectWallet to connect a wallet first.',
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Connected Wallet:\nPublic Key: ${wallet.publicKey}\nBalance: ${wallet.balance?.toFixed(4)} SOL\nStatus: ${wallet.connected ? 'Connected' : 'Disconnected'}`,
            },
          ],
        };
      }

      case 'disconnectWallet': {
        disconnectWallet();
        return {
          content: [
            {
              type: 'text',
              text: '✅ Wallet disconnected successfully.',
            },
          ],
        };
      }

      case 'buySolana': {
        const { amount } = args as { amount: string };
        if (!amount) {
          throw new Error('amount parameter is required');
        }

        // Parse the natural language amount to USD value
        const usdAmount = parseNaturalLanguageAmount(amount);
        
        const result = await buySolana(usdAmount);
        return {
          content: [
            {
              type: 'text',
              text: `🎉 ${result.message}\n\n📊 Transaction Details:\n• SOL Received: ${result.solReceived.toFixed(4)} SOL\n• USD Spent: $${result.usdSpent.toFixed(2)}\n• New Balance: ${result.newBalance.toFixed(4)} SOL\n• Transaction Fee: 0.5%`,
            },
          ],
        };
      }

      case 'sellSolana': {
        const { amount } = args as { amount: string };
        if (!amount) {
          throw new Error('amount parameter is required');
        }

        // Get current wallet for context
        const wallet = getConnectedWallet();
        const context = {
          balance: wallet?.balance || 0,
          solPrice: await getCurrentSolanaPrice()
        };

        // Parse the natural language amount to SOL value
        const solAmount = parseNaturalLanguageAmount(amount, context);
        
        const result = await sellSolana(solAmount);
        return {
          content: [
            {
              type: 'text',
              text: `💰 ${result.message}\n\n📊 Transaction Details:\n• SOL Sold: ${result.solSold.toFixed(4)} SOL\n• USD Received: $${result.usdReceived.toFixed(2)}\n• New Balance: ${result.newBalance.toFixed(4)} SOL\n• Transaction Fee: 0.5%`,
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
          text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
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
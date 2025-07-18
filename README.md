# Solana MCP Chat Application

A full-stack chat application that connects a Next.js frontend to a Solana MCP (Model Context Protocol) server. Users can chat with an AI assistant that can perform various Solana blockchain operations.

## Architecture

```
Frontend (Next.js) → API Route → HTTP Server → MCP Server → Solana Functions
```

- **Frontend**: Next.js React app with chat interface
- **API Route**: `/api/chat` endpoint that proxies requests
- **HTTP Server**: Bun-based server that handles chat requests
- **MCP Server**: Model Context Protocol server with Solana tools
- **Solana Functions**: Direct blockchain interaction functions

## Features

🔍 **SOL Price Checking**: Get current Solana price from CoinGecko
💳 **Balance Queries**: Check SOL balance for any public key
🔗 **Wallet Connection**: Connect and manage wallet sessions
📊 **Wallet Status**: View connected wallet information
🔌 **Wallet Disconnect**: Safely disconnect wallets

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Node.js 18+ (for Next.js compatibility)

## Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
bun install

# Install MCP server dependencies
cd ../mcp-server
bun install
```

### 2. Environment Setup

Create a `.env` file in the `mcp-server` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from [Groq Console](https://console.groq.com/).

## Running the Application

### Method 1: Manual Start (Recommended for Development)

1. **Start the MCP HTTP Server** (Terminal 1):
```bash
cd mcp-server
bun run dev
```

2. **Start the Frontend** (Terminal 2):
```bash
cd frontend
bun run dev
```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - MCP Server: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Method 2: Production Start

1. **Start the MCP HTTP Server**:
```bash
cd mcp-server
bun run start
```

2. **Start the Frontend**:
```bash
cd frontend
bun run build && bun run start
```

## Usage Examples

Once both servers are running, you can interact with the chat interface:

### Basic Commands

- **Check SOL Price**: "What's the current SOL price?"
- **Check Balance**: "What's the balance for 11111111111111111111111111111112"
- **Connect Wallet**: "Connect wallet [your-public-key]"
- **Wallet Status**: "What's my wallet status?"
- **Disconnect**: "Disconnect wallet"
- **Help**: Just type "help" or any general message

### Example Conversations

```
User: What's the current SOL price?
Bot: 💰 Current SOL price: $99.42 USD

User: What's the balance for 11111111111111111111111111111112
Bot: 💳 Balance for 11111111...11111112:
     0.0000 SOL ($0.00 USD)

User: Connect wallet 11111111111111111111111111111112
Bot: ✅ Wallet connected successfully!
     Public Key: 11111111111111111111111111111112
     Balance: 0.0000 SOL
```

## Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── api/chat/route.ts # API endpoint for chat
│   │   ├── chat/page.tsx     # Chat page
│   │   └── layout.tsx        # App layout
│   ├── components/
│   │   └── ChatInterface.tsx # Main chat component
│   └── package.json
├── mcp-server/               # MCP server and backend
│   ├── http-server.ts        # HTTP server for frontend communication
│   ├── simple-chat-service.ts # Chat processing service
│   ├── solana-mcp-server.ts  # MCP protocol server
│   ├── index.ts              # Solana blockchain functions
│   ├── client.ts             # MCP client example
│   └── package.json
└── README.md                 # This file
```

## Available Scripts

### Frontend
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server

### MCP Server
- `bun run dev` - Start HTTP server with hot reload
- `bun run start` - Start HTTP server
- `bun run mcp-server` - Run MCP server directly
- `bun run client` - Run MCP client example

## Troubleshooting

### Common Issues

1. **"MCP server is not running" error**:
   - Make sure the MCP HTTP server is running on port 3001
   - Check if port 3001 is available

2. **CORS errors**:
   - The HTTP server includes CORS headers, but make sure both servers are running

3. **API key errors**:
   - Ensure your Groq API key is set in the `.env` file
   - Verify the API key is valid

4. **Solana network issues**:
   - The app uses Solana mainnet by default
   - Network issues may cause price/balance fetch failures

### Development Tips

- Use `bun run dev` for hot reloading during development
- Check the browser console and terminal logs for detailed error messages
- The health check endpoint (`http://localhost:3001/health`) can verify the MCP server is running

## Technical Details

### Communication Flow

1. User types message in frontend chat interface
2. Frontend sends POST request to `/api/chat`
3. API route forwards request to MCP HTTP server (`localhost:3001/chat`)
4. HTTP server processes message using `SimpleChatService`
5. Service calls appropriate Solana functions based on message content
6. Response flows back through the chain to display in chat interface

### MCP Integration

The application uses the Model Context Protocol to expose Solana functions as tools that can be called by AI assistants. The MCP server (`solana-mcp-server.ts`) defines tools for:

- Getting current Solana price
- Checking SOL balances
- Connecting/disconnecting wallets
- Buying/selling Solana (in development)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both servers running
5. Submit a pull request

## License

This project is licensed under the MIT License. 
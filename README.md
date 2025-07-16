# Solana MCP Server

A Model Context Protocol (MCP) server that provides Solana blockchain functionality including wallet management, trading, and balance checking.

## Features

### 🔍 Price & Balance Checking
- **getCurrentSolanaPrice**: Get the current SOL price in USD
- **getSolBalance**: Check SOL balance for any public key

### 💼 Wallet Management
- **connectWallet**: Connect your Solana wallet using your public key
- **getConnectedWallet**: View information about your connected wallet
- **disconnectWallet**: Disconnect your current wallet

### 💰 Trading (Simulated)
- **buySolana**: Buy SOL using USD with natural language amounts
- **sellSolana**: Sell SOL for USD with natural language amounts

## Natural Language Support

The buy/sell functions support natural language inputs:

### Buying SOL
- `"$100"` - Buy $100 worth of SOL
- `"50 USD"` - Buy $50 worth of SOL
- `"200 dollars"` - Buy $200 worth of SOL

### Selling SOL
- `"1.5 SOL"` - Sell 1.5 SOL
- `"half my balance"` - Sell 50% of your SOL
- `"all"` or `"everything"` - Sell all your SOL
- `"quarter"` - Sell 25% of your SOL

## Getting Started

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Run the server**:
   ```bash
   bun run solana-mcp-server.ts
   ```

3. **Connect your wallet**:
   Use the `connectWallet` tool with your Solana public key

4. **Start trading**:
   Use natural language to buy and sell SOL!

## Example Usage

1. **Connect a wallet**:
   ```
   connectWallet: { "publicKey": "YourSolanaPublicKeyHere" }
   ```

2. **Buy some SOL**:
   ```
   buySolana: { "amount": "$100" }
   ```

3. **Check your balance**:
   ```
   getConnectedWallet: {}
   ```

4. **Sell half your SOL**:
   ```
   sellSolana: { "amount": "half my balance" }
   ```

## Technical Details

- **Network**: Currently configured for Solana Devnet
- **Trading**: Simulated with 0.5% transaction fees
- **Price Data**: Real-time prices from CoinGecko API
- **Framework**: Built with MCP SDK for AI assistant integration

## Dependencies

- `@solana/web3.js` - Solana blockchain interaction
- `@modelcontextprotocol/sdk` - MCP server framework
- `@solana/wallet-adapter-base` - Wallet connection utilities
- `node-fetch` - HTTP requests for price data

## Notes

⚠️ **Important**: This is a demonstration/development tool with simulated trading. In a production environment, you would integrate with actual DEXes (like Jupiter, Raydium) or CEXes for real trading functionality.

The server runs on Solana Devnet by default, which means any transactions are simulated and don't affect real funds.

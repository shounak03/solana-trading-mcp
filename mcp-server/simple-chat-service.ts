import { getCurrentSolanaPrice, getSolBalance, connectWallet, getConnectedWallet, disconnectWallet } from './index.js';

interface ChatResponse {
  content: string;
  error?: string;
}

export class SimpleChatService {
  async processMessage(message: string): Promise<ChatResponse> {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Price queries
      if (lowerMessage.includes('price') || lowerMessage.includes('sol')) {
        try {
          const price = await getCurrentSolanaPrice();
          return {
            content: `💰 Current SOL price: $${price.toFixed(2)} USD`
          };
        } catch (error) {
          return {
            content: "Sorry, I couldn't fetch the current Solana price right now."
          };
        }
      }
      
      // Balance queries
      if (lowerMessage.includes('balance')) {
        // Extract public key if provided
        const pubKeyMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
        if (pubKeyMatch && pubKeyMatch[1]) {
          try {
            const publicKey = pubKeyMatch[1];
            const balance = await getSolBalance(publicKey);
            const price = await getCurrentSolanaPrice();
            const usdValue = balance * price;
            return {
              content: `💳 Balance for ${publicKey.slice(0, 8)}...${publicKey.slice(-8)}:\n${balance.toFixed(4)} SOL ($${usdValue.toFixed(2)} USD)`
            };
          } catch (error) {
            return {
              content: "Sorry, I couldn't fetch the balance for that address."
            };
          }
        } else {
          return {
            content: "To check a balance, please provide a Solana public key. Example: 'What's the balance for 11111111111111111111111111111112'"
          };
        }
      }
      
      // Wallet connection
      if (lowerMessage.includes('connect')) {
        const pubKeyMatch = message.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
        if (pubKeyMatch && pubKeyMatch[1]) {
          try {
            const publicKey = pubKeyMatch[1];
            const walletInfo = await connectWallet(publicKey);
            return {
              content: `✅ Wallet connected successfully!\nPublic Key: ${walletInfo.publicKey}\nBalance: ${walletInfo.balance?.toFixed(4)} SOL`
            };
          } catch (error) {
            return {
              content: "Sorry, I couldn't connect to that wallet."
            };
          }
        } else {
          return {
            content: "To connect a wallet, please provide a public key. Example: 'Connect wallet 11111111111111111111111111111112'"
          };
        }
      }
      
      // Get connected wallet info
      if (lowerMessage.includes('wallet') && (lowerMessage.includes('status') || lowerMessage.includes('connected'))) {
        try {
          const wallet = getConnectedWallet();
          if (!wallet) {
            return {
              content: "No wallet currently connected. Use 'connect wallet [your-public-key]' to connect a wallet."
            };
          }
          return {
            content: `Connected Wallet:\nPublic Key: ${wallet.publicKey}\nBalance: ${wallet.balance?.toFixed(4)} SOL\nStatus: ${wallet.connected ? 'Connected' : 'Disconnected'}`
          };
        } catch (error) {
          return {
            content: "Error checking wallet status."
          };
        }
      }
      
      // Disconnect wallet
      if (lowerMessage.includes('disconnect')) {
        try {
          disconnectWallet();
          return {
            content: "✅ Wallet disconnected successfully."
          };
        } catch (error) {
          return {
            content: "Error disconnecting wallet."
          };
        }
      }
      
      // Help/default response
      return {
        content: `Hi! I'm your Solana assistant. I can help you with:

🔍 **Check SOL price**: "What's the current SOL price?"
💳 **Check balances**: "What's the balance for [public-key]?"
🔗 **Connect wallet**: "Connect wallet [your-public-key]"
📊 **Wallet status**: "What's my wallet status?"
🔌 **Disconnect**: "Disconnect wallet"

Try asking me something about Solana!`
      };
      
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        content: "Sorry, I encountered an error processing your request.",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Singleton instance
let simpleChatService: SimpleChatService | null = null;

export function getSimpleChatService(): SimpleChatService {
  if (!simpleChatService) {
    simpleChatService = new SimpleChatService();
  }
  return simpleChatService;
} 
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatGroq } from "@langchain/groq";

interface ChatResponse {
  content: string;
  error?: string;
}

export class ChatService {
  private client: MultiServerMCPClient | null = null;
  private model: ChatGroq | null = null;
  private tools: any[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.client = new MultiServerMCPClient({
        solana: {
          command: "bun",
          args: ["run", "solana-mcp-server.ts"], 
          transport: "stdio",
        },
      });

      this.tools = await this.client.getTools();
      
      this.model = new ChatGroq({ 
        model: "llama-3.1-8b-instant",
        apiKey: process.env.GROQ_API_KEY 
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      throw error;
    }
  }

  async processMessage(message: string): Promise<ChatResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Use the LLM to understand the user intent and determine which tools to call
      const systemPrompt = `You are a helpful Solana assistant. You have access to the following tools:
${this.tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

For the user's message, determine if you need to call any tools and respond accordingly.
If you need to call tools, use a structured format to indicate which tool to call with what parameters.
`;

      const response = await this.model!.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]);

      let content = response.content as string;

      // Simple tool detection and calling logic
      if (message.toLowerCase().includes('price') || message.toLowerCase().includes('solana')) {
        try {
          const priceData = await this.callTool('getCurrentSolanaPrice', {});
          content = `Current Solana price: ${priceData}`;
        } catch (error) {
          content = "Sorry, I couldn't fetch the current Solana price.";
        }
      } else if (message.toLowerCase().includes('balance')) {
        content = "To check a balance, please provide a Solana public key. Example: 'Get balance for 11111111111111111111111111111112'";
      } else if (message.toLowerCase().includes('connect wallet')) {
        content = "To connect a wallet, please provide a public key. Example: 'Connect wallet 11111111111111111111111111111112'";
      }
      
      return { content };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        content: "Sorry, I encountered an error processing your request.",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async callTool(toolName: string, parameters: any): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }
    
    try {
      const result = await this.client.callTool(toolName, parameters);
      return JSON.stringify(result);
    } catch (error) {
      throw new Error(`Tool call failed: ${error}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.client) {
      this.client = null;
      this.model = null;
      this.tools = [];
      this.isInitialized = false;
    }
  }
}

// Singleton instance
let chatService: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatService) {
    chatService = new ChatService();
  }
  return chatService;
} 
import { config } from "dotenv";
config();

import { MultiServerMCPClient } from "@langchain/mcp-adapters"; // hypothetical TS SDK
import { createReactAgent } from "@langchain/langgraph/prebuilt"; // hypothetical TS SDK
import { ChatGroq } from "@langchain/groq"
async function main() {
  const client = new MultiServerMCPClient({
    solana: {
      command: "bun",
      args: ["run", "solana-mcp-server.ts"], 
      transport: "stdio",
    },
  });

  process.env.GROQ_API_KEY = process.env.GROQ_API_KEY;

  const tools = await client.getTools();

  const model = new ChatGroq({ model: "qwen/qwen3-32b" });

  const agent = createReactAgent({ llm: model, tools });

  const priceResponse = await agent.invoke({
    messages: [
      { role: "user", content: "What is the current Solana price?" },
    ],
  });

  console.log("Solana price response:", priceResponse.messages.at(-1)?.content);

  const balanceResponse = await agent.invoke({
    messages: [
      { role: "user", content: "Get the SOL balance for public key 11111111111111111111111111111112" },
    ],
  });
  console.log("SOL balance response:", balanceResponse.messages.at(-1)?.content);
}

main().catch(console.error);

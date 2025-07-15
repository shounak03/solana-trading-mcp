import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fetch from 'node-fetch';

// Solana RPC endpoint (you can use mainnet-beta, devnet, or testnet)
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Fetches the current Solana (SOL) price in USD
 * @returns Promise<number> - Current SOL price in USD
 */
export async function getCurrentSolanaPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }
    
    const data = await response.json() as { solana: { usd: number } };
    return data.solana.usd;
  } catch (error) {
    console.error('Error fetching Solana price:', error);
    throw error;
  }
}

/**
 * Fetches the SOL balance for a given public key
 * @param publicKeyString - The public key as a string
 * @returns Promise<number> - Balance in SOL
 */
export async function getSolBalance(publicKeyString: string): Promise<number> {
  try {
    const publicKey = new PublicKey(publicKeyString);
    const balance = await connection.getBalance(publicKey);
    
    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Fetch current SOL price
    console.log('Fetching current Solana price...');
    const price = await getCurrentSolanaPrice();
    console.log(`Current SOL price: $${price.toFixed(2)}`);
    
    // Example public key (replace with a real one to test)
    const examplePublicKey = '11111111111111111111111111111112'; // System Program public key
    
    console.log(`\nFetching SOL balance for: ${examplePublicKey}`);
    const balance = await getSolBalance(examplePublicKey);
    console.log(`SOL Balance: ${balance.toFixed(4)} SOL`);
    
    // Calculate USD value
    const usdValue = balance * price;
    console.log(`USD Value: $${usdValue.toFixed(2)}`);
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the example
main();
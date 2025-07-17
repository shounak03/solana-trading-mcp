// import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import fetch from 'node-fetch';

import { Jupiter, TOKEN_LIST_URL } from '@jup-ag/core';
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';

// Solana RPC endpoint (you can use mainnet-beta, devnet, or testnet)
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Store connected wallet info (in a real app, this would be more sophisticated)
interface WalletInfo {
    publicKey: string;
    connected: boolean;
    balance?: number;
}

let connectedWallet: WalletInfo | null = null;

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

/**
 * Connect a wallet by public key (simulated connection)
 * @param publicKeyString - The wallet's public key
 * @returns Promise<WalletInfo> - Connected wallet information
 */
export async function connectWallet(publicKeyString: string): Promise<WalletInfo> {
    try {
        // Validate the public key
        const publicKey = new PublicKey(publicKeyString);

        // Get the balance
        const balance = await getSolBalance(publicKeyString);

        // Store wallet info
        connectedWallet = {
            publicKey: publicKeyString,
            connected: true,
            balance: balance
        };

        return connectedWallet;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
    }
}

/**
 * Get connected wallet information
 * @returns WalletInfo | null - Current connected wallet or null if not connected
 */
export function getConnectedWallet(): WalletInfo | null {
    return connectedWallet;
}

/**
 * Disconnect the current wallet
 */
export function disconnectWallet(): void {
    connectedWallet = null;
}

/**
 * Simulate buying Solana (in reality, this would integrate with a DEX or CEX)
 * @param usdAmount - Amount in USD to spend on SOL
 * @returns Promise<object> - Transaction details
 */
// export async function buySolana(usdAmount: number): Promise<{
//   success: boolean;
//   solReceived: number;
//   usdSpent: number;
//   newBalance: number;
//   message: string;
// }> {
//   try {
//     if (!connectedWallet) {
//       throw new Error('No wallet connected. Please connect a wallet first.');
//     }

//     if (usdAmount <= 0) {
//       throw new Error('Amount must be greater than 0');
//     }

//     // Store wallet reference for type safety
//     const wallet = connectedWallet;

//     // Get current SOL price
//     const solPrice = await getCurrentSolanaPrice();

//     // Calculate SOL amount to receive (minus a 0.5% fee for simulation)
//     const feeRate = 0.005;
//     const solReceived = (usdAmount / solPrice) * (1 - feeRate);

//     // Update wallet balance (simulated)
//     const currentBalance = await getSolBalance(wallet.publicKey);
//     const newBalance = currentBalance + solReceived;

//     // Update connected wallet info
//     wallet.balance = newBalance;

//     return {
//       success: true,
//       solReceived: solReceived,
//       usdSpent: usdAmount,
//       newBalance: newBalance,
//       message: `Successfully bought ${solReceived.toFixed(4)} SOL for $${usdAmount.toFixed(2)} USD at $${solPrice.toFixed(2)} per SOL`
//     };
//   } catch (error) {
//     console.error('Error buying Solana:', error);
//     throw error;
//   }
// }

/**
 * Simulate selling Solana (in reality, this would integrate with a DEX or CEX)
 * @param solAmount - Amount of SOL to sell
 * @returns Promise<object> - Transaction details
 */
// export async function sellSolana(solAmount: number): Promise<{
//   success: boolean;
//   usdReceived: number;
//   solSold: number;
//   newBalance: number;
//   message: string;
// }> {
//   try {
//     if (!connectedWallet) {
//       throw new Error('No wallet connected. Please connect a wallet first.');
//     }

//     if (solAmount <= 0) {
//       throw new Error('Amount must be greater than 0');
//     }

//     // Store wallet reference for type safety (we know it's not null from the check above)
//     const wallet = connectedWallet!;

//     // Get current balance
//     const currentBalance = await getSolBalance(wallet.publicKey);

//     if (solAmount > currentBalance) {
//       throw new Error(`Insufficient balance. Available: ${currentBalance.toFixed(4)} SOL, Requested: ${solAmount.toFixed(4)} SOL`);
//     }

//     // Get current SOL price
//     const solPrice = await getCurrentSolanaPrice();

//     // Calculate USD to receive (minus a 0.5% fee for simulation)
//     const feeRate = 0.005;
//     const usdReceived = (solAmount * solPrice) * (1 - feeRate);

//     // Update wallet balance (simulated)
//     const newBalance = currentBalance - solAmount;

//     // Update connected wallet info
//     wallet.balance = newBalance;

//     return {
//       success: true,
//       usdReceived: usdReceived,
//       solSold: solAmount,
//       newBalance: newBalance,
//       message: `Successfully sold ${solAmount.toFixed(4)} SOL for $${usdReceived.toFixed(2)} USD at $${solPrice.toFixed(2)} per SOL`
//     };
//   } catch (error) {
//     console.error('Error selling Solana:', error);
//     throw error;
//   }
// }

/**
 * Parse natural language amount into a number
 * @param input - Natural language input like "1.5 SOL", "$100", "half my balance", etc.
 * @param context - Context for relative amounts (like current balance)
 * @returns number - Parsed amount
 */
export function parseNaturalLanguageAmount(input: string, context?: { balance?: number; solPrice?: number }): number {
    const normalizedInput = input.toLowerCase().trim();

    // Remove currency symbols and common words
    let cleanInput = normalizedInput
        .replace(/[$,]/g, '')
        .replace(/\b(usd|dollars?|sol|solana)\b/g, '')
        .trim();

    // Handle relative amounts
    if (normalizedInput.includes('all') || normalizedInput.includes('everything')) {
        return context?.balance || 0;
    }

    if (normalizedInput.includes('half')) {
        return (context?.balance || 0) / 2;
    }

    if (normalizedInput.includes('quarter')) {
        return (context?.balance || 0) / 4;
    }

    // Extract numeric value
    const match = cleanInput.match(/(\d+\.?\d*)/);
    if (match) {
        return parseFloat(match[1]);
    }

    throw new Error(`Could not parse amount from: "${input}". Please use a numeric value like "1.5" or "$100"`);
}

// Example usage (commented out for MCP server usage)
// async function main() {
//   try {
//     // Fetch current SOL price
//     console.log('Fetching current Solana price...');
//     const price = await getCurrentSolanaPrice();
//     console.log(`Current SOL price: $${price.toFixed(2)}`);
//     
//     // Example public key (replace with a real one to test)
//     const examplePublicKey = '11111111111111111111111111111112'; // System Program public key
//     
//     console.log(`\nFetching SOL balance for: ${examplePublicKey}`);
//     const balance = await getSolBalance(examplePublicKey);
//     console.log(`SOL Balance: ${balance.toFixed(4)} SOL`);
//     
//     // Calculate USD value
//     const usdValue = balance * price;
//     console.log(`USD Value: $${usdValue.toFixed(2)}`);
//     
//   } catch (error) {
//     console.error('Error in main function:', error);
//   }
// }

// Run the example
getCurrentSolanaPrice().then(console.log);




export const swapSOLtoUSDC = async ( solAmount: number) => {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  const tokenList = await (await fetch(TOKEN_LIST_URL['mainnet-beta'])).json();

  const { publicKey } = useWallet();

  const jupiter = await Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
    user: PublicKey,
  });

  const USDC_MINT = new PublicKey('Es9vMFrzaCERhMPmxjSPdZRhqUWLWyd4aENcyuxR7zG');
  const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

  const amountIn = solAmount * 10 ** 9; // SOL has 9 decimals

  const { routes } = await jupiter.computeRoutes({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    amount: amountIn,
    slippage: 1,
  });

  if (!routes || routes.length === 0) {
    return {
      success: false,
      message: "No swap routes found",
    };
  }

  const bestRoute = routes[0];

  const { execute } = await jupiter.exchange({
    routeInfo: bestRoute,
  });

  try {
    const swapResult = await execute();

    const usdReceived = swapResult.outputAmount / 10 ** 6; // USDC has 6 decimals

    // Calculate implied SOL price from swap
    const solPrice = usdReceived / solAmount;

    // Fetch new SOL balance
    const newBalance = await connection.getBalance(wallet.publicKey) / 10 ** 9;

    return {
      success: true,
      usdReceived: usdReceived,
      solSold: solAmount,
      newBalance: newBalance,
      message: `Successfully sold ${solAmount.toFixed(4)} SOL for $${usdReceived.toFixed(2)} USD at $${solPrice.toFixed(2)} per SOL`
    };

  } catch (error) {
    console.error('Swap failed:', error);
    return {
      success: false,
      message: `Swap failed: ${error.message}`
    };
  }
};


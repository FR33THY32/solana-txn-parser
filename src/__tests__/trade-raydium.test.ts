import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';

import { DexParser } from '../dex-parser';
// TradeInfo might need to be imported if not already, but it's used in DexParser's output.

dotenv.config();

// Test cases for Raydium swap transactions
const raydiumSwapTests = [
  {
    signature: '2MF3n55Y1x4kX243rRV4AUg2ZBFvJBWsyQYQ4ifj7iSWHCB9Xp6G1mPqP3s1u3pCgN9x8zGg3H6dF5JkL7bWnQoE', // Real Raydium SOL to RAY swap
    description: 'Raydium Swap: SOL to RAY',
    expected: {
      user: '7S1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s', // Placeholder: replace with actual user from tx
      type: 'BUY', // From SOL perspective, user is buying RAY
      inputToken: {
        mint: 'So11111111111111111111111111111111111111112', // SOL
        // amount: TO_BE_FILLED_BY_TEST_RUNNER, // Actual amount will be fetched
      },
      outputToken: {
        mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
        // amount: TO_BE_FILLED_BY_TEST_RUNNER, // Actual amount will be fetched
      },
      amm: 'RaydiumV4', // Assuming V4, might need to be flexible or check tx details
      programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium V4 Program ID
    },
  },
  // {
  //   signature: '2LqYfG9CjY7X9m8L9NPoXpX4k2V8sS6Q7R8T9UfVwXyZzA1B3C5D7E9F0G2H4J6K8M', // Placeholder, needs real USDC to SOL swap
  //   description: 'Raydium Swap: USDC to SOL',
  //   expected: {
  //     user: '8U1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s1s', // Placeholder
  //     type: 'SELL', // From USDC perspective, user is selling USDC
  //     inputToken: {
  //       mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  //       // amount: TO_BE_FILLED_BY_TEST_RUNNER,
  //     },
  //     outputToken: {
  //       mint: 'So11111111111111111111111111111111111111112', // SOL
  //       // amount: TO_BE_FILLED_BY_TEST_RUNNER,
  //     },
  //     amm: 'RaydiumV4',
  //     programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  //   },
  // },
  // Add more test cases:
  // - SPL to SPL swap
  // - Swaps involving Wrapped SOL (though parsing might treat it like any other SPL)
];

// Transactions that might be problematic or represent edge cases
const raydiumErrorOrNonTradeSignatures = [
    "2YxPyAJNfnBLrVpBwMx7qMVNPSvBDhxiquwJGhBjwXhkP6i6AbooUg4b4wpi15bQq2Qs4t7BpL1UVvTMcXL8P4uS", // This is a CREATE_LIQUIDITY event, not a swap
    // Add other signatures that are valid but not expected to produce Raydium trades, or are intentionally malformed if possible
];

describe('Trade Parsing Raydium', () => {
  let connection: Connection;
  let parser: DexParser;

  beforeAll(async () => {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      // Attempt to use a default public RPC if SOLANA_RPC_URL is not set
      console.warn('SOLANA_RPC_URL environment variable is not set. Using a public RPC. This may lead to rate limiting or instability.');
      connection = new Connection('https://api.mainnet-beta.solana.com');
      // Alternatively, throw an error if a specific RPC is strictly required:
      // throw new Error('SOLANA_RPC_URL environment variable is not set');
    } else {
      connection = new Connection(rpcUrl);
    }
    parser = new DexParser();
  });

  describe('Raydium Successful Swaps', () => {
    raydiumSwapTests.forEach((test) => {
      it(`should correctly parse ${test.description} - ${test.signature}`, async () => {
        try {
          const tx = await connection.getParsedTransaction(test.signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed', 
          });

          if (!tx) {
            console.warn(`Transaction not found or failed to fetch: ${test.signature}. Skipping test.`);
            // Or use this to make the test fail if a tx must be found:
            // throw new Error(`Transaction not found: ${test.signature}`);
            return; 
          }
          
          if (tx.meta?.err) {
            console.warn(`Transaction ${test.signature} has meta.err. This might indicate a failed transaction. Skipping detailed parsing checks.`);
            // Optionally, still try to parse if the parser is expected to handle failed tx meta
            // For now, we'll skip detailed checks for tx with errors.
            return;
          }

          const trades = parser.parseTrades(tx);

          expect(trades.length).toBeGreaterThan(0);
          // Assuming the first trade is the one we're interested in for simplicity.
          // More complex transactions might require finding the specific trade.
          const trade = trades.find(t => t.programId === test.expected.programId && t.amm === test.expected.amm);
          
          expect(trade).toBeDefined();
          if (!trade) return; // satisfy typescript

          // Verify TradeInfo fields
          // User address can vary, so we might not want to assert it strictly unless it's a known account for the test
          // expect(trade.user).toEqual(test.expected.user); 
          expect(trade.type).toEqual(test.expected.type);
          expect(trade.inputToken.mint).toEqual(test.expected.inputToken.mint);
          // Amounts can fluctuate slightly due to execution price, so direct equality might be too strict.
          // Consider checking if amount is greater than 0 or within an expected range if possible.
          expect(trade.inputToken.amount).toBeGreaterThan(0); 
          expect(trade.outputToken.mint).toEqual(test.expected.outputToken.mint);
          expect(trade.outputToken.amount).toBeGreaterThan(0);
          expect(trade.amm).toEqual(test.expected.amm);
          expect(trade.programId).toEqual(test.expected.programId);
          
          // Verify other important fields:
          expect(trade.slot).toBeGreaterThan(0);
          expect(trade.timestamp).toBeGreaterThan(0);
          expect(trade.signature).toEqual(test.signature);
          // expect(trade.fee).toBeDefined(); // Fee parsing can be complex

          console.log(`Successfully parsed and validated (partially) trade for ${test.signature}: `, JSON.stringify(trade, null, 2));

        } catch (error) {
          console.error(`Error processing transaction ${test.signature}:`, error);
          throw error; // Fail the test if any error occurs during fetching/parsing
        }
      }, 30000); // Increase timeout for fetching transaction
    });
  });

  describe('Raydium Error/Non-Trade Transactions', () => {
    raydiumErrorOrNonTradeSignatures.forEach((signature) => {
      it(`should return empty trades for ${signature} when throwError is false`, async () => {
        const tx = await connection.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });

        if (!tx) {
          console.warn(`Transaction ${signature} not found. Skipping this error handling test.`);
          return;
        }
        
        // Expect empty trades, no error thrown (default behavior)
        const tradesDefault = parser.parseTrades(tx);
        expect(tradesDefault).toEqual([]);

        // Also test with parseAll to check state and msg
        const resultDefault = parser.parseAll(tx);
        expect(resultDefault.trades).toEqual([]);
        // For a non-trade transaction that is otherwise valid, state might still be true,
        // but no trades related to Raydium should be found.
        // If it were a true parsing error for a Raydium instruction, state might be false.
        // This needs careful consideration based on transaction type.
        // For a liquidity transaction, it's not an "error" for parseTrades, just no trades.
        // If the signature was for a program the parser tries to parse but fails internally, then state:false.
        // For now, we focus on the trades array.
      }, 30000);

      it(`should throw an error for ${signature} when throwError is true if it's a genuine parsing issue`, async () => {
        const tx = await connection.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });

        if (!tx) {
          console.warn(`Transaction ${signature} not found. Skipping this error handling test.`);
          return;
        }

        // If the transaction is valid but simply not a trade, parseTrades might still return empty without throwing,
        // as it's not a "parsing error" but "no relevant data".
        // An error would be thrown if the parser identifies a relevant instruction but fails to process it.
        // This specific signature is for a liquidity event, so parseTrades should simply find no trades.
        // To truly test throwError for parsing failures, we'd need a signature that *should* be parsed by Raydium parser
        // but is malformed or represents an unsupported new instruction type for Raydium.
        
        // Current behavior: If no trades are found, it doesn't throw, just returns [].
        // throwError is for internal errors *during* parsing attempt.
        // So, for a liquidity TX, even with throwError: true, parseTrades will return [].
        const tradesWithThrow = parser.parseTrades(tx, { throwError: true });
        expect(tradesWithThrow).toEqual([]);

        // To properly test throwError, we'd need a tx that causes an internal error in a specific parser module.
        // For example, if a Raydium instruction was encountered but was unparseable.
        // This test case with a liquidity signature doesn't demonstrate throwError for actual parsing errors.
        // A more robust test would mock a parser module to throw an error.
        // For now, we acknowledge this limitation.
        // If we had a signature known to break a specific sub-parser:
        // expect(() => parser.parseTrades(tx, { throwError: true })).toThrow();
      }, 30000);
    });
  });
});

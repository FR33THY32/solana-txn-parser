import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';

import { TransactionAdapter } from '../transaction-adapter';
import { DexParser } from '../dex-parser';

dotenv.config();

const tests = {
  CREATE: [
    {
      signature: '2YxPyAJNfnBLrVpBwMx7qMVNPSvBDhxiquwJGhBjwXhkP6i6AbooUg4b4wpi15bQq2Qs4t7BpL1UVvTMcXL8P4uS',
      type: 'CREATE',
      desc: 'Singer > Raydium Liquidity Pool V4: initialize2',
      name: 'Coca-Cola',
      poolId: 'GGJZ7ayp5urhWaTikqFvm3ahggobmaEtz7wgettXrr31',
      token0Mint: '3ZmaEAKC75ereKNTxZeaDxxHLNWag2rL43UY19Rw6v7D',
      token0Amount: 50000000,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 1,
    },
    {
      signature: 'FHz3LurEFNnWREXSfqpenJTRuzybQrmxsNjndmMDw36XUwUofSQ1vRQwVi6uT422Xe2Whb7gfFY3tHGqvEBg6dF',
      type: 'CREATE',
      desc: 'Singer > Raydium Liquidity Pool V4: initialize2',
      name: 'CASH',
      poolId: 'GmF1c1CSwm56Hx2mfJnjK8WT5eNCuDyHrHDbBYiM3U5f',
      token0Mint: '56dtyR73VF1MKHLVusZgTkAvEeDYkQqneqZqkusLgyb4',
      token0Amount: 50000000,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 1,
    },
    {
      signature: '5MRWUUoCWpaFm8B9jSoLp4w6B19p46jcJMQrm26SHHGRZQpAtG3mdEcqGVDwsgUEGKRmC1R6JMFS5NhzmXUnR3X1',
      type: 'CREATE',
      desc: 'Moonshot > Raydium Liquidity Pool V4: initialize2',
      name: 'SLTX',
      poolId: 'GHrKkupnWVxQokfCfrYtmQMKnVE5s9873gJCg3wGrcTw',
      token0Mint: '591irbGXZLfqDneLqwDHLJFgS9UxxVzBmyFkWPeTmoon',
      token0Amount: 187674338.64251745,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 84.116339594,
    },
    {
      signature: '4998xRsghpLWWcZsFFtfN8UBss9SVkN8sMUPkqdBzYS6eRVuxve3RoT89pqBaYvHDgqPSsFt9GDGQc6Us3pwPX5v',
      type: 'CREATE',
      desc: 'Pumpfun > Raydium Liquidity Pool V4: initialize2',
      name: 'CAR',
      poolId: 'Bx5pAzBqbuYH5yT93XCoShDka6d6vz9AzBddG7zE9syh',
      token0Mint: '7oBYdEhV4GkXC19ZfgAvXpJWp2Rn9pm1Bx2cVNxFpump',
      token0Amount: 206900000,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 79.005359057,
    },
    {
      signature: '49ejTjaCdqV3hwAs1GomGsTLqZNUWztHduHRCNr8m3Dogfyii29qkNPNauAr9VfEh9j5m7QHq8HYRd6FiaAACCf',
      type: 'CREATE',
      desc: 'Pumpfun > Raydium Liquidity Pool V4: initialize2',
      name: 'BQFIN',
      poolId: 'Fidv7mwYxFgRVL3qHFJrGQmrhiwn6bvso7pUqU1r1db8',
      token0Mint: 'npvXPTd172PepW5HMdgayiNuqKqbSsd3DArCeeTpump',
      token0Amount: 206900000,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 79.005359118,
    },
  ],
  ADD: [
    {
      signature: '4zFeXoUVaaQ18chkY899hvvTYBRMAJ6CaNfWxbchMDDEY1L56maqwAdY19Faif5LBoTxwBPeEamcEsh76b39fjia',
      type: 'ADD',
      desc: 'Singer > Raydium Liquidity Pool V4: raydium:add-liquidity',
      name: 'CAR',
      poolId: 'Bx5pAzBqbuYH5yT93XCoShDka6d6vz9AzBddG7zE9syh',
      token0Mint: '7oBYdEhV4GkXC19ZfgAvXpJWp2Rn9pm1Bx2cVNxFpump',
      token0Amount: 1950.837707,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 0.147754335,
    },
    {
      signature: '2S4DdkD4FpqazTn5qHd4x9X5bAHu9g5Ry3jCLWkE44UCmW8bwkcet9eeAsHbzyR7HWtiE3gV268MtsBNrc4X6KpL',
      type: 'ADD',
      desc: 'Singer > Raydium Liquidity Pool V4: raydium:add-liquidity',
      name: 'jellyjelly',
      poolId: '3bC2e2RxcfvF9oP22LvbaNsVwoS2T98q6ErCRoayQYdq',
      token0Mint: 'FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump',
      token0Amount: 10279267.251303,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 370.892851447,
    },
  ],
  REMOVE: [
    {
      signature: '2MvpoPWEY3gnEE5WxsQATRRa15Go6p8HxBbuxATiTUMxCRJeVQsBCPnCRdrM5YModikwpTiKu1iZbPBeTdHkg3uv',
      type: 'REMOVE',
      desc: 'Singer > Raydium Liquidity Pool V4: raydium:add-liquidity',
      name: 'CAR',
      poolId: 'Bx5pAzBqbuYH5yT93XCoShDka6d6vz9AzBddG7zE9syh',
      token0Mint: '7oBYdEhV4GkXC19ZfgAvXpJWp2Rn9pm1Bx2cVNxFpump',
      token0Amount: 696.848377,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 0.055709162,
    },
    {
      signature: '33HpWkDo8tr4r3jQCnML7ojpL3pFLHiE5yLZsbJDGe1mQzdg7aeJ9EKyD6WayEY4Q1hEivca93bP82TzsVcLzkgf',
      type: 'REMOVE',
      desc: 'Singer > Raydium Liquidity Pool V4: raydium:remove-liquidity',
      name: 'jellyjelly',
      poolId: '3bC2e2RxcfvF9oP22LvbaNsVwoS2T98q6ErCRoayQYdq',
      token0Mint: 'FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump',
      token0Amount: 12152.01771,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 0.375727077,
    },
  ],
};

// These are valid transactions but are primarily trades, not liquidity events.
// parseLiquidity should return empty for these.
const nonLiquiditySignatures = [
  "4Cod1cNGv6RboJ7rSB79yeVCR4Lfd25rFgLY3eiPJfTJjTGyYP1r2i1upAYZHQsWDqUbGd1bhTRm1bpSQcpWMnEz", // Pumpfun trade
  "oXUd22GQ1d45a6XNzfdpHAX6NfFEfFa9o2Awn2oimY89Rms3PmXL1uBJx3CnTYjULJw6uim174b3PLBFkaAxKzK", // RaydiumV4 trade
  // Add more if needed
];

describe('Liquidity', () => {
  let connection: Connection;
  beforeAll(async () => {
    // Initialize connection
    let rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      console.warn('SOLANA_RPC_URL environment variable is not set for liquidity-raydium.test.ts. Using a public RPC. This may lead to rate limiting or instability.');
      rpcUrl = 'https://api.mainnet-beta.solana.com';
    }
    connection = new Connection(rpcUrl);
  });

  describe('Raydium V4', () => {
    Object.values(tests)
      .flat()
      .forEach((test) => {
        it(`${test.type} > ${test.name} > ${test.desc} `, async () => {
          const tx = await connection.getParsedTransaction(test.signature, {
            maxSupportedTransactionVersion: 0,
          });
          if (!tx) throw new Error('Transaction not found');
          const parser = new DexParser();
          const events = parser.parseLiquidity(tx);
          console.log(events);
          expect(events.length).toEqual(1);
          expect(events[0].type).toEqual(test.type);
          expect(events[0].poolId).toEqual(test.poolId);
          expect(events[0].token0Mint).toEqual(test.token0Mint);
          expect(events[0].token0Amount).toEqual(test.token0Amount);
          expect(events[0].token1Mint).toEqual(test.token1Mint);
          expect(events[0].token1Amount).toEqual(test.token1Amount);
        });
      });
  });

  describe('Raydium V4 Non-Liquidity Transactions', () => {
    nonLiquiditySignatures.forEach((signature) => {
      it(`should return empty liquidity events for ${signature} when throwError is false`, async () => {
        const tx = await connection.getTransaction(signature, { // Uses getTransaction, returns TransactionResponse
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });
        if (!tx) {
          console.warn(`Transaction ${signature} not found. Skipping this non-liquidity test.`);
          return;
        }
        const parser = new DexParser();
        const events = parser.parseLiquidity(tx); // Default throwError = false
        expect(events).toEqual([]);

        // Test with parseAll to check state (though for a valid non-liquidity tx, state should be true)
        const resultDefault = parser.parseAll(tx);
        expect(resultDefault.liquidities).toEqual([]);
        // For a valid trade transaction, parseAll should have result.state = true,
        // as the tx itself is fine, just no liquidity events.
        // If it were a tx that failed Raydium parsing specifically, state might be false.
        expect(resultDefault.state).toBe(true); 
        expect(resultDefault.msg).toBeUndefined();
      });

      it(`should return empty liquidity events for ${signature} when throwError is true (as it's not a parsing error)`, async () => {
        const tx = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });
        if (!tx) {
          console.warn(`Transaction ${signature} not found. Skipping this non-liquidity test.`);
          return;
        }
        const parser = new DexParser();
        // For a transaction that is simply not a liquidity event (but otherwise valid),
        // throwError: true should not cause an error. An error is for actual parsing failures.
        const events = parser.parseLiquidity(tx, { throwError: true });
        expect(events).toEqual([]);

        // To properly test throwError:true for liquidity parsing, one would need a signature
        // known to represent a malformed/unsupported Raydium liquidity instruction.
        // expect(() => parser.parseLiquidity(tx, { throwError: true })).toThrow();
      });
    });
  });
});

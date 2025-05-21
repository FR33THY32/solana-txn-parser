import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
import { DexParser } from '../dex-parser';

dotenv.config();

const tests = {
  ADD: [
    {
      signature: '3mZcyeDJysgs79nLcvtN4XQ6iepyERqG93P2F2ZYgUX4ZF1Yr1XFBMKR8DHd7z4gN2EmvAqMc3KhQTQpGMbtvhF7',
      type: 'ADD',
      desc: ' Whirlpools Program: increaseLiquidity',
      name: 'JUP',
      poolId: 'C1MgLojNLWBKADvu9BHdtgzz1oZX4dZ5zGdGcgvvW8Wz',
      token0Mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      token0Amount: 6931.015285,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 45.407996732,
    },
    {
      signature: '4Kv6gQgdSsCPSxRApiCNMHFE1dKKGVugrJTzdzSYX5a2aXho4o7jaQDSHLH3RTsr5aVwpkzWL1o5mSCyDtHeZKZr',
      type: 'ADD',
      desc: 'Whirlpools Program: increaseLiquidityV2',
      name: 'STRIKE',
      poolId: 'Djf5NYkwhdipTW3ZScPeUkjf7BLtDdxLvEGtNyWMtw3d',
      token0Mint: 'STrikemJEk2tFVYpg7SMo9nGPrnJ56fHnS1K7PV2fPw',
      token0Amount: 2000000,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 6.315579644,
    },
  ],
  REMOVE: [
    {
      signature: '23zkGAorUC3aHSk7zJYiUvvs6gEXPPzp8xRiWfACzkrqBEaQrKiH9QCgrmwSTD6hxKKEjryEGbEvurt6xSBpuBMC',
      type: 'REMOVE',
      desc: 'Whirlpools Program: decreaseLiquidity',
      name: 'JUP',
      poolId: 'C1MgLojNLWBKADvu9BHdtgzz1oZX4dZ5zGdGcgvvW8Wz',
      token0Mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      token0Amount: 106.470976,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 0.475676716,
    },
  ],
};

describe('Liquidity', () => {
  let connection: Connection;
  beforeAll(async () => {
    // Initialize connection
    let rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      console.warn('SOLANA_RPC_URL environment variable is not set for liquidity-orca.test.ts. Using a public RPC. This may lead to rate limiting or instability.');
      rpcUrl = 'https://api.mainnet-beta.solana.com';
    }
    connection = new Connection(rpcUrl);
  });

  describe('Orca', () => {
    Object.values(tests)
      .flat()
      .forEach((test) => {
        it(`${test.type} > ${test.name} > ${test.desc} `, async () => {
          const tx = await connection.getTransaction(test.signature, {
            maxSupportedTransactionVersion: 0,
          });
          if(!tx) throw new Error('Transaction not found');
          const parser = new DexParser();
          const events = parser.parseLiquidity(tx);
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
});

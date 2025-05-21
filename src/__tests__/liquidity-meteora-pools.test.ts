import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
import { DexParser } from '../dex-parser';

dotenv.config();

const tests = {
  CREATE: [
    {
      signature: '2GWLwbEjyR7moFYK5JfapbsDBrBz3298BVWsAebhUECPaXjLbTZ6DkbEN34BF57jdGot7GkwDnrzszFB3H9AJxmS',
      type: 'CREATE',
      desc: 'Meteora Pools Program: initializePermissionlessConstantProductPoolWithConfig',
      name: 'STRIKE',
      poolId: 'BCXjm4FfSoquZQJV5Wcje1g1pSHW2hFMU9wDE98Nyatb',
      token0Mint: 'STrikemJEk2tFVYpg7SMo9nGPrnJ56fHnS1K7PV2fPw',
      token0Amount: 100000000,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 2740,
    },
  ],
  ADD: [
    {
      signature: 'LaocVd6PpfdH1KTdQuRTf5WwnUzmyf3gdAy16xro747nzrhpgXg1oxFrpgBk31tPh24ksVAyiSkNW7vncoKTGyH',
      type: 'ADD',
      desc: 'Meteora Pools Program: addBalanceLiquidity',
      name: 'STRIKE',
      poolId: 'BCXjm4FfSoquZQJV5Wcje1g1pSHW2hFMU9wDE98Nyatb',
      token0Mint: 'STrikemJEk2tFVYpg7SMo9nGPrnJ56fHnS1K7PV2fPw',
      token0Amount: 720.780405,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 0.029097874,
    },
  ],
  REMOVE: [
    {
      signature: '2xEAewTjtSHgpEHHzaNjHiuoMHNZQXz5vySXHCSL8omujjvaxq9JsfGWjusz43ndmzcu5riESKm1UH4riWDX9v1v',
      type: 'REMOVE',
      desc: ' Meteora Pools Program: removeBalanceLiquidity',
      name: 'STRIKE',
      poolId: 'BCXjm4FfSoquZQJV5Wcje1g1pSHW2hFMU9wDE98Nyatb',
      token0Mint: 'STrikemJEk2tFVYpg7SMo9nGPrnJ56fHnS1K7PV2fPw',
      token0Amount: 14938.609562,
      token1Mint: 'So11111111111111111111111111111111111111112',
      token1Amount: 0.578534516,
    },
  ],
};

describe('Liquidity', () => {
  let connection: Connection;
  beforeAll(async () => {
    // Initialize connection
    let rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      console.warn('SOLANA_RPC_URL environment variable is not set for liquidity-meteora-pools.test.ts. Using a public RPC. This may lead to rate limiting or instability.');
      rpcUrl = 'https://api.mainnet-beta.solana.com';
    }
    connection = new Connection(rpcUrl);
  });

  describe('Meteora Pools', () => {
    Object.values(tests)
      .flat()
      .forEach((test) => {
        it(`${test.type} > ${test.name} > ${test.desc} `, async () => {
          const tx = await connection.getTransaction(test.signature, {
            maxSupportedTransactionVersion: 0,
          });
          if (!tx) throw new Error('Transaction not found');
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

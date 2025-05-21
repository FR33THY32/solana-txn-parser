## Add Comprehensive Tests

Testing is a critical part of integrating a new DEX parser. Comprehensive tests ensure your parser correctly interprets transaction data, handles various scenarios, and remains robust as the codebase or DEX program evolves.

### Importance of Testing

*   **Accuracy:** Verifies that your parser extracts the correct information (token amounts, mints, accounts, event types) from real transactions.
*   **Reliability:** Ensures the parser consistently works for different transaction patterns (e.g., swaps, liquidity additions/removals, different tokens).
*   **Regression Prevention:** Catches issues that might arise from future changes to the parser, shared utilities, or the DEX program itself.
*   **Documentation:** Tests serve as live documentation, demonstrating how the parser is expected to behave with certain inputs.

### 1. Create Test Files

Test files are typically located in the `src/__tests__/` directory, often mirroring the structure of your `src/` directory or organized by functionality. For a new DEX parser, you might create a specific test file.

**Example Structure:**

```
src/
├── __tests__/
│   ├── parsers/
│   │   ├── my-custom-dex.parser.test.ts  // <-- Your new test file
│   │   └── raydium.parser.test.ts        // Example for another parser
│   └── services/
│       └── dex-parser.service.test.ts
└── parsers/
    └── my-custom-dex/
        └── MyCustomDexParser.ts
```

**Naming Convention:** Use a descriptive name, typically `[module-name].[type].test.ts` (e.g., `my-custom-dex.parser.test.ts`).

### 2. Test Structure (using Jest or similar)

Most JavaScript/TypeScript projects use a testing framework like Jest, Mocha, or Jasmine. The examples below assume a Jest-like syntax.

**Basic structure for `my-custom-dex.parser.test.ts`:**

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { DexParser } from '../../services/dex-parser'; // Adjust path to your main DexParser service
import { CUSTOM_DEX_PROGRAM_ID } from '../../constants'; // Your DEX program ID
import { ITrade, TradeType, Source, ILiquidityChange, LiquidityChangeType } from '../../types'; // Standardized types

// Mock connection or use a real one for integration tests (devnet/testnet)
const MOCK_RPC_URL = 'https://api.devnet.solana.com'; // Or your preferred RPC

describe('MyCustomDexParser', () => {
  let connection: Connection;
  let dexParser: DexParser;

  beforeAll(() => {
    connection = new Connection(MOCK_RPC_URL);
    // Assuming DexParser takes connection and initializes internal parserMap
    dexParser = new DexParser(connection);
    // Ensure your MyCustomDexParser is registered within DexParser's parserMap
    // (as covered in "Register the New Parser" section)
  });

  describe('Swap Transactions', () => {
    it('should correctly parse a simple swap transaction', async () => {
      const signature = 'YOUR_SAMPLE_SWAP_TRANSACTION_SIGNATURE_HERE'; // From a real transaction
      
      // Fetch and parse the transaction
      // The DexParser service should handle fetching and delegating to the correct parser
      const parsedEvents = await dexParser.parseTransaction(signature);

      // Assertions
      expect(parsedEvents).toBeDefined();
      expect(parsedEvents.length).toBeGreaterThanOrEqual(1);

      const tradeEvent = parsedEvents.find(event => event.type === TradeType.SWAP && event.source === Source.MY_CUSTOM_DEX) as ITrade | undefined;
      
      expect(tradeEvent).toBeDefined();
      if (!tradeEvent) return; // Type guard

      expect(tradeEvent.source).toEqual(Source.MY_CUSTOM_DEX); // Your DEX source enum/constant
      expect(tradeEvent.type).toEqual(TradeType.SWAP);
      expect(tradeEvent.signature).toEqual(signature);
      expect(new PublicKey(tradeEvent.account).equals(new PublicKey('USER_ACCOUNT_PUBKEY_INVOLVED_IN_SWAP'))).toBe(true);

      // Token In Assertions
      expect(tradeEvent.tokenIn.mint).toEqual('MINT_ADDRESS_OF_TOKEN_IN');
      expect(tradeEvent.tokenIn.amount).toEqual('EXPECTED_AMOUNT_OF_TOKEN_IN_AS_STRING'); // Amounts are often strings
      expect(tradeEvent.tokenIn.symbol).toEqual('SYM_IN'); // Fetch or hardcode expected symbol

      // Token Out Assertions
      expect(tradeEvent.tokenOut.mint).toEqual('MINT_ADDRESS_OF_TOKEN_OUT');
      expect(tradeEvent.tokenOut.amount).toEqual('EXPECTED_AMOUNT_OF_TOKEN_OUT_AS_STRING');
      expect(tradeEvent.tokenOut.symbol).toEqual('SYM_OUT');

      // Optional: Check fees, market, slot, timestamp (within a range)
      // expect(tradeEvent.fee?.amount).toEqual('EXPECTED_FEE_AMOUNT');
      // expect(tradeEvent.market).toEqual('EXPECTED_MARKET_ADDRESS');
      expect(tradeEvent.timestamp).toBeInstanceOf(Date);
    });

    // Add more test cases for:
    // - Swaps with different token pairs
    // - Swaps involving wrapped SOL (SOL <-> WSOL)
    // - Transactions that fail or have reverted swaps (if your parser should identify these)
    // - Edge cases specific to your DEX
  });

  describe('Liquidity Transactions (if applicable)', () => {
    it('should correctly parse an add liquidity transaction', async () => {
      const signature = 'YOUR_SAMPLE_ADD_LIQUIDITY_SIGNATURE_HERE';
      const parsedEvents = await dexParser.parseTransaction(signature);
      
      expect(parsedEvents).toBeDefined();
      const liquidityEvent = parsedEvents.find(event => event.type === LiquidityChangeType.ADD && event.source === Source.MY_CUSTOM_DEX) as ILiquidityChange | undefined;

      expect(liquidityEvent).toBeDefined();
      if (!liquidityEvent) return;

      expect(liquidityEvent.source).toEqual(Source.MY_CUSTOM_DEX);
      expect(liquidityEvent.type).toEqual(LiquidityChangeType.ADD);
      // ... more detailed assertions for tokenA, tokenB, lpToken amounts and mints
    });

    // Add tests for remove liquidity, etc.
  });

  // Test cases for transactions NOT related to your DEX
  it('should return an empty array or specific non-event for unrelated transactions', async () => {
    const signatureForOtherProgram = 'SIGNATURE_OF_TX_NOT_INTERACTING_WITH_YOUR_DEX';
    const parsedEvents = await dexParser.parseTransaction(signatureForOtherProgram);
    
    // Option 1: Expect empty array if no relevant instructions
    // expect(parsedEvents).toEqual([]);

    // Option 2: Or filter for your DEX's events if other parsers might return events
    const customDexEvents = parsedEvents.filter(event => event.source === Source.MY_CUSTOM_DEX);
    expect(customDexEvents.length).toEqual(0);
  });

});
```

### 3. Fetching Real Transaction Data

*   **Transaction Signatures:** Obtain signatures of real transactions involving your DEX. Use a Solana explorer (e.g., Solscan, Solana Explorer) on mainnet-beta, devnet, or testnet where your DEX is deployed.
    *   Find transactions for various operations: swaps (different pairs), adding liquidity, removing liquidity.
    *   Capture transactions with different outcomes or edge cases if possible.
*   **`dexParser.parseTransaction(signature)`:** Your main `DexParser` service should ideally have a method that takes a signature, fetches the transaction using the `Connection` object, and then delegates to the appropriate registered parser (like your `MyCustomDexParser`) based on the program ID(s) found in the transaction's instructions.

### 4. Making Detailed Assertions

*   **Primary Fields:** Always assert the core fields: `source`, `type`, `signature`, `account` (the user/authority).
*   **Token Details:** For `tokenIn`, `tokenOut` (in trades) or `tokenA`, `tokenB`, `lpToken` (in liquidity events):
    *   `mint`: The public key of the token mint.
    *   `amount`: The quantity of tokens, usually as a string to handle large numbers (u64).
    *   `symbol`: The token symbol (you might need a helper to get this or hardcode expected values for test stability).
*   **Timestamps and Slots:** Check that `timestamp` is a `Date` object and `slot` (if parsed) is a number. For timestamps, you might check if it's within a reasonable range if exact matching is difficult due to block time variations.
*   **Optional Fields:** If your parser extracts fees, market addresses, or other specific data, assert these values.
*   **Array Lengths:** Ensure the `parsedEvents` array has the expected number of events. A single transaction might contain multiple actions relevant to your DEX.
*   **Negative Tests:** Test with transactions that are *not* for your DEX to ensure your parser doesn't incorrectly process them or that `DexParser` correctly routes (or doesn't route) to your parser.

### 5. Running Tests

Add a script to your `package.json` to run tests, typically using Jest CLI.

**Example `package.json` script:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:parser:my-custom-dex": "jest src/__tests__/parsers/my-custom-dex.parser.test.ts"
  }
}
```

You can then run tests using:

```bash
npm test
# or
yarn test

# To run a specific test file:
npm run test:parser:my-custom-dex
# or
yarn test:parser:my-custom-dex
```

### Tips for Effective Testing

*   **Use Real Signatures:** Prioritize testing against actual on-chain transactions. Mocking transaction data can be complex and might miss real-world intricacies.
*   **Cover Edge Cases:** Think about unusual scenarios: zero amounts, new/unknown tokens, transactions that partially fail but still have some parseable actions.
*   **Isolate Parser Logic:** While testing via `DexParser` is good for integration, you can also write unit tests that directly instantiate `MyCustomDexParser` and call its `parse` method with `ParsedTransactionWithMeta` objects if you want to test the parser in more isolation (though fetching/mocking `ParsedTransactionWithMeta` is still needed).
*   **Keep Tests Updated:** If your DEX program changes or your parser logic is updated, remember to update your tests accordingly.

By investing in comprehensive testing, you build confidence in your DEX integration and contribute to the overall stability of the application.
```

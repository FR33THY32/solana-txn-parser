## Implement the Core Parsing Logic

This section details how to implement the core parsing logic within your custom DEX parser (e.g., `MyCustomDexParser.ts`). This involves decoding instruction data, identifying relevant token transfers, and processing them into standardized trade or liquidity event structures.

### 1. Decoding Instruction Data

The first step within your `parse` method, after identifying instructions relevant to your DEX, is to decode the instruction data. Solana instructions typically contain a discriminator (to identify the instruction type) followed by serialized data.

**Using Anchor Coder:**

If your DEX program is built with Anchor, the `Program` instance provides a coder to decode instructions.

```typescript
// Inside MyCustomDexParser.ts - within the parse method or a helper

// Assuming 'instruction' is an item from tx.transaction.message.instructions
// and 'this.program' is your initialized Anchor Program instance.

try {
  const decodedInstruction = this.program.coder.instruction.decode(instruction.data, 'base58');
  // decodedInstruction will be an object like { name: 'instructionName', data: { ...parsed_args } }

  if (decodedInstruction) {
    // Now you can use a switch or if/else based on decodedInstruction.name
    // to handle different DEX instructions (e.g., swap, addLiquidity).
    switch (decodedInstruction.name) {
      case 'swap':
        // this.processSwapInstruction(decodedInstruction.data, tx.meta, signature, instruction, tx);
        break;
      case 'addLiquidity':
        // this.processAddLiquidityInstruction(decodedInstruction.data, tx.meta, signature, instruction, tx);
        break;
      // Add other cases as needed
      default:
        console.log(`Unknown instruction for MyCustomDex: ${decodedInstruction.name}`);
    }
  } else {
    console.warn(`Failed to decode instruction data for MyCustomDex in tx: ${signature}`);
  }
} catch (error) {
  console.error(`Error decoding instruction for MyCustomDex: ${error}`, instruction.data);
}
```

**Manual Decoding (e.g., with Borsh):**

If your program doesn't use Anchor or you need more control, you might need to decode instruction data manually. `getInstructionData` (from `src/utils/solanaUtils.ts`) can help extract the core data, and a library like `borsh` can be used for deserialization if your program uses Borsh.

1.  **Define a Schema:** Create a Borsh schema that matches your instruction's data structure.
2.  **Deserialize:** Use `borsh.deserialize`.

```typescript
import * as borsh from '@coral-xyz/borsh';
import { getInstructionData } from '../../utils'; // Adjust path

// Example schema for a swap instruction
const SWAP_INSTRUCTION_SCHEMA = new Map([
  [
    Object, // Placeholder for the actual class if you define one
    {
      kind: 'struct',
      fields: [
        ['discriminator', [8]], // Assuming an 8-byte discriminator
        ['amountIn', 'u64'],
        ['minAmountOut', 'u64'],
        // ... other fields
      ],
    },
  ],
]);


// Inside your instruction handling logic:
const instructionDataBuffer = getInstructionData(instruction.data); // instruction.data is base58 string

if (instructionDataBuffer) {
  try {
    // Check discriminator if needed to select the correct schema
    // const discriminator = instructionDataBuffer.slice(0, 8);
    // if (discriminator.equals(YOUR_SWAP_DISCRIMINATOR)) { ... }

    const deserializedData = borsh.deserialize(
      SWAP_INSTRUCTION_SCHEMA,
      Object, // Placeholder or your class
      instructionDataBuffer.slice(8) // Skip discriminator if handled separately or part of schema
    );
    // Now use deserializedData.amountIn, etc.
    // this.processSwapInstruction(deserializedData, tx.meta, signature, instruction, tx);

  } catch (error) {
    console.error('Borsh deserialization error:', error);
  }
}
```

### 2. Processing Trades (`processTrades`)

For swap or trade instructions, your goal is to extract details like input/output tokens, amounts, and participating accounts. The `getTransfersForInstruction` utility is crucial here.

Create a method like `processSwapInstruction` (or a more generic `processTrades`) that takes the decoded instruction data, transaction metadata (`tx.meta`), and other relevant info.

```typescript
// Inside MyCustomDexParser.ts

import {
  // ... other imports
  ParsedInstruction,
  ParsedTransactionWithMeta,
  TokenBalance,
} from '@solana/web3.js';
import { ITrade, Source, TradeType } from '../../types'; // Your standardized types
import { getTransfersForInstruction, getTokenInfoByMint } from '../../utils'; // Adjust path

// ...

private async processSwapInstruction(
  decodedData: any, // Type this based on your decoded instruction structure
  meta: ParsedTransactionWithMeta['meta'],
  signature: string,
  instruction: ParsedInstruction, // The raw instruction
  transaction: ParsedTransactionWithMeta // Full transaction for context
): Promise<ITrade | null> {
  if (!meta) {
    console.warn(`Transaction meta not available for ${signature}. Skipping trade processing.`);
    return null;
  }

  const transfers = getTransfersForInstruction(instruction, meta.innerInstructions || [], signature);

  if (transfers.length < 2) {
    // A swap typically involves at least two transfers (token in, token out)
    console.warn(`Not enough token transfers found for a swap in ${signature}: ${transfers.length}`);
    return null;
  }

  // Use utils.processSwapData or implement custom logic:
  // processSwapData helps identify sender, receiver, input/output amounts and mints
  // from a list of transfers. You might need to adapt it or write custom logic
  // if your DEX has a complex transfer pattern (e.g., multiple intermediate steps).

  // Example: Assuming processSwapData can be used or adapted
  // You might need to determine which account is the authority/source of funds
  // based on decodedData or instruction.accounts.

  // Placeholder: You'll need to derive these from `decodedData` and `instruction.accounts`
  const userAccount = transaction.transaction.message.accountKeys.find(
    (acc) => acc.signer // A simple heuristic, might need to be more robust
  )?.pubkey;

  if (!userAccount) {
    console.warn(`Could not determine user account for swap in ${signature}`);
    return null;
  }
  
  // The `processSwapData` utility from `src/utils/helpers.ts` can be a good starting point.
  // It typically requires pre/post token balances to accurately determine amounts if not explicit in instruction data.
  // However, for many DEXs, the transfer amounts are directly available.

  // Let's assume a simple scenario:
  // Transfer 1: User's source token to DEX pool
  // Transfer 2: DEX pool's destination token to User
  // This is a simplified example. Real DEXs can have more complex transfer patterns.

  const tokenInTransfer = transfers.find(t => t.source?.equals(userAccount) || t.authority?.equals(userAccount)); // Or based on known pool accounts
  const tokenOutTransfer = transfers.find(t => t.destination?.equals(userAccount)); // Or based on known pool accounts

  if (!tokenInTransfer || !tokenOutTransfer) {
    console.warn(`Could not identify tokenIn/tokenOut transfers for swap in ${signature}`);
    return null;
  }

  const tokenInMint = tokenInTransfer.mint;
  const tokenInAmount = tokenInTransfer.amount;
  const tokenOutMint = tokenOutTransfer.mint;
  const tokenOutAmount = tokenOutTransfer.amount;

  if (!tokenInMint || !tokenInAmount || !tokenOutMint || !tokenOutAmount) {
    console.warn(`Missing mint or amount in swap transfers for ${signature}`);
    return null;
  }
  
  const tokenInInfo = await getTokenInfoByMint(new PublicKey(tokenInMint), this.connection);
  const tokenOutInfo = await getTokenInfoByMint(new PublicKey(tokenOutMint), this.connection);

  const trade: ITrade = {
    signature,
    timestamp: transaction.blockTime ? new Date(transaction.blockTime * 1000) : new Date(),
    source: Source.MY_CUSTOM_DEX, // Your DEX identifier
    type: TradeType.SWAP,
    account: userAccount.toBase58(),
    tokenIn: {
      mint: tokenInMint,
      amount: tokenInAmount,
      symbol: tokenInInfo?.symbol || 'UNK',
      decimals: tokenInInfo?.decimals || 0,
    },
    tokenOut: {
      mint: tokenOutMint,
      amount: tokenOutAmount,
      symbol: tokenOutInfo?.symbol || 'UNK',
      decimals: tokenOutInfo?.decimals || 0,
    },
    // Optional fields:
    // fee: { ... },
    // slot: transaction.slot,
    // market: 'market_address_if_applicable',
  };

  console.log('Processed Trade:', JSON.stringify(trade, null, 2));
  return trade;
}
```

**Key points for `processSwapInstruction`:**

*   **`getTransfersForInstruction`:** This utility, found in `src/utils/solanaUtils.ts`, extracts all SPL token transfers associated with a given instruction, including those from inner instructions. This is vital as many DEX operations involve CPIs to the SPL Token Program.
*   **Identifying Input/Output:** The logic to determine which transfer is the input and which is the output depends on your DEX's design. You might use:
    *   The `authority` or `source` fields in the transfers.
    *   Account keys provided in the instruction itself (e.g., `decodedData.sourceTokenAccount`, `decodedData.destinationTokenAccount`).
    *   Knowledge of how your DEX's pools or AMM works.
*   **`utils.processSwapData`:** The existing `processSwapData` function in `src/utils/helpers.ts` is designed for specific DEXs (like Raydium) and relies on pre/post token balances. You may need to:
    *   **Adapt it:** If your DEX has a similar pattern.
    *   **Write custom logic:** If transfer amounts are explicit or the pattern is different. The example above shows a simplified custom logic.
*   **Token Information:** Use `getTokenInfoByMint` (from `src/utils/rpc.ts`) to fetch token symbol and decimals for user-friendly display.
*   **`ITrade` Interface:** Map the extracted data to your standardized `ITrade` interface (defined in `src/types/index.ts`).

### 3. Processing Liquidity (`processLiquidity`)

Similar to trades, you'll need a method like `processAddLiquidityInstruction` or `processRemoveLiquidityInstruction`.

```typescript
// Inside MyCustomDexParser.ts (conceptual example)
// import { ILiquidityChange, LiquidityChangeType, ... } from '../../types';

private async processAddLiquidityInstruction(
  decodedData: any,
  meta: ParsedTransactionWithMeta['meta'],
  signature: string,
  instruction: ParsedInstruction,
  transaction: ParsedTransactionWithMeta
): Promise<ILiquidityChange | null> { // Assuming ILiquidityChange type
  if (!meta) return null;

  const transfers = getTransfersForInstruction(instruction, meta.innerInstructions || [], signature);

  // Logic to identify:
  // - User providing liquidity
  // - Token A mint and amount
  // - Token B mint and amount (if applicable)
  // - LP token mint and amount received (if applicable)

  // Example: find user, tokens, amounts based on transfers and decodedData
  // ...

  // const liquidityEvent: ILiquidityChange = {
  //   signature,
  //   timestamp: new Date(transaction.blockTime! * 1000),
  //   source: Source.MY_CUSTOM_DEX,
  //   type: LiquidityChangeType.ADD,
  //   account: userAccount.toBase58(),
  //   tokenA: { mint: tokenAMint, amount: tokenAAmount, ... },
  //   tokenB: { mint: tokenBMint, amount: tokenBAmount, ... }, // If it's a dual-sided pool
  //   lpToken: { mint: lpTokenMint, amount: lpTokenAmountReceived, ... }, // If applicable
  // };
  // return liquidityEvent;
  return null; // Placeholder
}
```

The principles are the same: use `getTransfersForInstruction`, analyze the transfers along with decoded instruction data to understand the flow of tokens, and map it to a standardized liquidity event interface (e.g., `ILiquidityChange`).

### 4. Updating the Main `parse` Method

Your main `parse` method in `MyCustomDexParser.ts` will call these specific processing methods based on the decoded instruction name.

```typescript
// Inside MyCustomDexParser.ts

async parse(
  signature: string,
  tx: ParsedTransactionWithMeta,
): Promise<Array<ITrade | ILiquidityChange>> { // Example return type
  if (!tx || !tx.meta) {
    console.warn(`Transaction data or meta not available for signature: ${signature}. Skipping.`);
    return [];
  }

  const results: Array<ITrade | ILiquidityChange> = [];

  const relevantInstructions = tx.transaction.message.instructions.filter(
    (ix) => ix.programId.equals(this.programId) // Or your imported CUSTOM_DEX_PROGRAM_ID
  );

  for (const instruction of relevantInstructions) {
    const parsedInstruction = instruction as ParsedInstruction; // Cast if necessary for type checks
    try {
      const decodedInstruction = this.program.coder.instruction.decode(parsedInstruction.data, 'base58');

      if (decodedInstruction) {
        let event: ITrade | ILiquidityChange | null = null;
        switch (decodedInstruction.name) {
          case 'swap': // Or your actual instruction name for swaps
            event = await this.processSwapInstruction(decodedInstruction.data, tx.meta, signature, parsedInstruction, tx);
            break;
          case 'addLiquidity': // Or your actual instruction name
            // event = await this.processAddLiquidityInstruction(decodedInstruction.data, tx.meta, signature, parsedInstruction, tx);
            break;
          // ... other cases
        }
        if (event) {
          results.push(event);
        }
      } else {
        // Handle cases where decoding returns null (e.g., unknown instruction variant for your program)
        // Potentially try manual decoding if Anchor coder fails for specific instructions
      }
    } catch (error) {
      console.error(`Error decoding or processing instruction for ${this.programId.toBase58()} in tx ${signature}: ${error}`, parsedInstruction.data);
      // Fallback or specific error handling
    }
  }
  return results;
}
```

This structure allows you to handle multiple DEX interactions within a single transaction and return an array of parsed events. Remember to adjust types and method names according to your specific DEX and data models.
The `processSwapData` utility mentioned is located at `src/utils/helpers.ts` (though its direct applicability might vary). Key utilities like `getTransfersForInstruction` are typically in `src/utils/solanaUtils.ts` or similar. Ensure your import paths are correct.
```

# Guide: Adding a Custom DEX Parser

This guide provides a comprehensive walkthrough for integrating a new, custom Decentralized Exchange (DEX) parser into the existing Solana transaction parsing framework. It covers everything from initial setup to final testing and refinement.

Before you begin with the steps outlined below, it's crucial to have a solid understanding of the custom DEX you intend to integrate. This means you should have the following information ready:

*   **Program ID:** The on-chain public key of the DEX program.
*   **Instruction Layouts:** Detailed knowledge of the instruction data structures for the actions you want to parse (e.g., swaps, liquidity provision). This includes any discriminators used to identify instruction types and the serialization format (e.g., Borsh).
*   **IDL (Interface Definition Language):** If the DEX uses Anchor or a similar framework, its IDL will be invaluable for understanding instruction and account structures.
*   **Typical Transaction Signatures:** A collection of sample transaction signatures from the DEX operating on devnet, testnet, or mainnet. These will be essential for development and testing. Look for examples of different operations (swaps, liquidity changes) and edge cases.
*   **Account Structures:** Understanding of any DEX-specific account structures that your parser might need to fetch or interpret.

Once you have this information, you can proceed with the following steps to build and integrate your custom DEX parser.

## Set up Constants for the Custom DEX

This section guides you through setting up the necessary constants for your custom DEX integration. These constants include the DEX program ID and any discriminators required by your program.

### Add the DEX Program ID

The program ID is a unique identifier for your on-chain DEX program. You need to add this ID to the `src/constants/programId.ts` file.

1.  **Open `src/constants/programId.ts`:** Navigate to this file in your project.
2.  **Add your DEX program ID:** Define a constant for your DEX program ID. It's a good practice to use a descriptive name.

    ```typescript
    // src/constants/programId.ts

    import { PublicKey } from '@solana/web3.js';

    // ... other program IDs

    export const CUSTOM_DEX_PROGRAM_ID = new PublicKey('YOUR_DEX_PROGRAM_ID_HERE');
    ```

    **Replace `YOUR_DEX_PROGRAM_ID_HERE` with the actual public key of your DEX program.**

### Add Discriminators (If Applicable)

Some programs use discriminators to distinguish between different instruction types or account types. If your DEX program uses discriminators, you should define them in `src/constants/discriminators.ts`.

1.  **Open `src/constants/discriminators.ts`:** Navigate to this file. If it doesn't exist, you can create it.
2.  **Define your discriminators:** Add constants for each discriminator. These are typically byte arrays or numbers.

    **Example:**

    Let's say your DEX program has an instruction to create a new pool, and this instruction is identified by a specific discriminator (e.g., the first 8 bytes of the instruction data).

    ```typescript
    // src/constants/discriminators.ts

    // Discriminator for the 'createPool' instruction
    export const CREATE_POOL_DISCRIMINATOR = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

    // Discriminator for a 'PoolState' account type
    export const POOL_STATE_ACCOUNT_DISCRIMINATOR = Buffer.from([10, 11, 12, 13, 14, 15, 16, 17]);

    // Or if your discriminators are simple numbers
    export const SWAP_INSTRUCTION_DISCRIMINATOR = 0;
    export const ADD_LIQUIDITY_INSTRUCTION_DISCRIMINATOR = 1;
    ```

    **Adjust the names and values according to your DEX program's specific requirements.** If your program doesn't use discriminators for instructions or accounts that the integration will interact with, you might be able to skip this step for those specific parts.

By setting up these constants, you make your integration code cleaner and easier to maintain, as program-specific identifiers are centralized and clearly defined.

## Create Parser Directory and Basic Structure

This section outlines how to set up the directory structure and initial files for your custom DEX parser. A consistent structure helps in organizing parsers for different DEXs.

### 1. Create the Parser Directory

First, you need to create a new directory for your custom DEX parser within the `src/parsers/` directory. The name of this directory should be specific to the DEX you are integrating (e.g., `my-custom-dex`).

**Example Structure:**

```
src/
└── parsers/
    ├── existing-dex-1/
    ├── existing-dex-2/
    └── my-custom-dex/  <-- Your new parser directory
```

You can create this directory using your file explorer or a terminal command:

```bash
mkdir src/parsers/my-custom-dex
```

Replace `my-custom-dex` with the chosen name for your DEX integration.

### 2. Create the Main Parser File

Inside your new DEX directory (`src/parsers/my-custom-dex/`), create the main TypeScript file for your parser. Conventionally, this file is named after the DEX, for example, `MyCustomDexParser.ts`.

This file will contain the class that extends `BaseParser` and implements the specific parsing logic for your DEX's instructions.

**Initial Structure for `src/parsers/my-custom-dex/MyCustomDexParser.ts`:**

```typescript
import { Idl, Program } from '@coral-xyz/anchor';
import { Connection, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { BaseParser } from '../BaseParser'; // Adjust path as necessary
// Import your DEX-specific IDL type if you have one, e.g., import { MyCustomDex } from '../../types/my_custom_dex';
// Import any constants you set up, e.g., import { CUSTOM_DEX_PROGRAM_ID } from '../../constants';

// Define a type for your program, using the generic Program type from Anchor
// and your DEX's IDL. Replace `any` with your actual IDL type if available.
// type MyCustomDexProgram = Program<any>; // Example: Program<MyCustomDex>

export class MyCustomDexParser extends BaseParser {
  // Store the program instance associated with this parser
  // protected program: MyCustomDexProgram; // Uncomment and type correctly

  constructor(
    public readonly programId: PublicKey,
    public readonly connection: Connection,
    public readonly idl: Idl, // Or your specific IDL type
  ) {
    super(programId, connection, idl);

    // Initialize the Anchor program instance
    // this.program = new Program(idl as any, programId, { connection }); // Uncomment and type IDL correctly
    // console.log(`Initialized MyCustomDexParser for program: ${programId.toBase58()}`); // Optional: for debugging
  }

  // Implementation of the abstract parse method from BaseParser
  async parse(
    signature: string,
    tx: ParsedTransactionWithMeta,
  ): Promise<void> { // Replace `void` with your expected return type, e.g., `CustomDexTransaction | null`
    if (!tx) {
      console.warn(`Transaction data not available for signature: ${signature}. Skipping.`);
      return; // Or return null
    }

    // Identify if the transaction involves your DEX program
    const relevantInstructions = tx.transaction.message.instructions.filter(
      (ix) => ix.programId.equals(this.programId) // Or use CUSTOM_DEX_PROGRAM_ID
    );

    if (relevantInstructions.length === 0) {
      // console.log(`No relevant instructions found for MyCustomDex in tx: ${signature}`); // Optional: for debugging
      return; // Or return null
    }

    console.log(`Parsing transaction ${signature} for MyCustomDex...`); // Optional: for debugging

    for (const instruction of relevantInstructions) {
      // Here you will add logic to decode and handle instructions
      // specific to your DEX.
      //
      // Example:
      // const decodedInstruction = this.program.coder.instruction.decode(instruction.data, 'base58');
      // if (decodedInstruction) {
      //   this.handleInstruction(decodedInstruction, tx.meta, signature);
      // } else {
      //   console.warn(`Failed to decode instruction for MyCustomDex in tx: ${signature}`);
      // }
    }

    // Return the parsed data or null/void
    return; // Or return parsedData;
  }

  // You will add more methods here to handle specific instructions,
  // map them to your data models, etc.
  //
  // private handleInstruction(decodedInstruction: any, meta: ParsedTransactionMeta | null, signature: string) {
  //   console.log(`Handling ${decodedInstruction.name} instruction in tx: ${signature}`);
  //   // Add logic based on instruction name or data
  // }
}
```

**Key considerations:**

*   **`BaseParser` Import:** Ensure the import path `../BaseParser` is correct based on your directory structure.
*   **IDL Type:** If you have a TypeScript type generated from your DEX's IDL (e.g., using Anchor), import and use it for `MyCustomDexProgram` and `this.program`. This provides type safety. If not, you might use `Program<any>` or `Program<Idl>`.
*   **Program ID:** You can pass the `programId` to the constructor or import it from your constants file.
*   **`parse` Method:** This is the core method you'll implement. The example shows basic filtering for relevant instructions. You'll need to add logic to decode instruction data (often using `program.coder.instruction.decode()`) and map it to meaningful information.

### 3. Create an `index.ts` for Exports

To make importing your new parser easier, create an `index.ts` file within your `src/parsers/my-custom-dex/` directory. This file will export the main parser class.

**Content for `src/parsers/my-custom-dex/index.ts`:**

```typescript
export * from './MyCustomDexParser';
```

This allows you to import your parser like so:

```typescript
import { MyCustomDexParser } from '../parsers/my-custom-dex'; // Or from appropriate path
```

### 4. Update the Main Parsers Index (Optional but Recommended)

Consider exporting your new DEX parser from the main `src/parsers/index.ts` file. This makes it discoverable and usable by the central parsing logic if your application has one.

**Example addition to `src/parsers/index.ts`:**

```typescript
// src/parsers/index.ts

export * from './existing-dex-1';
export * from './existing-dex-2';
export * from './my-custom-dex'; // <-- Add this line
```

This completes the basic file and directory setup. The next steps will involve implementing the actual parsing logic within `MyCustomDexParser.ts`.

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

## Register the New Parser

Once your custom DEX parser (e.g., `MyCustomDexParser`) is implemented, you need to register it within the broader parsing framework. This typically involves two main steps:

1.  **Exporting the parser module:** Make your parser accessible from the central `parsers` directory.
2.  **Adding to the parser map:** Integrate your parser into the main `DexParser` service so it can be selected and used for relevant program IDs.

### 1. Export from `src/parsers/index.ts`

The `src/parsers/index.ts` file serves as a central hub for all available DEX parsers. You need to export your new parser module from this file.

**Edit `src/parsers/index.ts`:**

Add an export line for your new parser directory. If your parser directory is named `my-custom-dex`, the addition would look like this:

```typescript
// src/parsers/index.ts

export * from './anchor-raydium'; // Example of an existing parser
export * from './lifinity';      // Example of an existing parser
export * from './phoenix';       // Example of an existing parser
// ... other existing parsers

export * from './my-custom-dex'; // <-- Add this line for your new parser
```

This makes `MyCustomDexParser` (and any other exports from `src/parsers/my-custom-dex/index.ts`) available when importing from `src/parsers`.

### 2. Add to `parserMap` in `src/dex-parser.ts`

The `DexParser` class (or a similar central service, likely located in `src/dex-parser.ts` or `src/services/DexParser.ts`) usually maintains a mapping between DEX program IDs and their corresponding parser classes. You need to add your custom DEX's program ID and parser class to this map.

**Edit `src/dex-parser.ts` (or the relevant service file):**

1.  **Import your new parser class and its program ID constant:**

    ```typescript
    // src/dex-parser.ts (or similar service file)

    import { Connection, PublicKey } from '@solana/web3.js';
    import { Idl } from '@coral-xyz/anchor'; // Or your specific IDL types

    // Import BaseParser and other existing parsers
    import { BaseParser } from './parsers/BaseParser';
    import { AnchorRaydiumParser, LifinityParser, PhoenixParser } from './parsers'; // Assuming these are exported via src/parsers/index.ts

    // Import your new parser and its program ID
    import { MyCustomDexParser } from './parsers/my-custom-dex'; // Adjust path if your parsers/index.ts is set up
    import { CUSTOM_DEX_PROGRAM_ID, RAYDIUM_PROGRAM_ID, LIFINITY_PROGRAM_ID, PHOENIX_PROGRAM_ID } from './constants'; // Ensure CUSTOM_DEX_PROGRAM_ID is defined

    // Potentially import IDLs if they are managed centrally
    // import MyCustomDexIDL from './idls/my_custom_dex.json';
    // import RaydiumIDL from './idls/raydium.json';
    // ... other IDLs
    ```

2.  **Add your parser to the `parserMap`:**

    The `parserMap` (or a similarly named variable) likely instantiates parser classes with their respective program IDs, connections, and IDLs.

    ```typescript
    // Inside the DexParser class or initialization logic

    // Assuming a structure like this:
    // private parserMap: Map<string, BaseParser>;
    // private connection: Connection;
    // private idls: Map<string, Idl>; // Or IDLs are passed directly

    constructor(connection: Connection /*, other dependencies like IDL provider/map */) {
      this.connection = connection;
      // this.idls = ... load IDLs ...
      this.parserMap = new Map<string, BaseParser>();

      // Initialize existing parsers
      // Example for Raydium:
      // const raydiumIdl = this.idls.get(RAYDIUM_PROGRAM_ID.toBase58()) || RaydiumIDL_fallback;
      // this.parserMap.set(
      //   RAYDIUM_PROGRAM_ID.toBase58(),
      //   new AnchorRaydiumParser(RAYDIUM_PROGRAM_ID, this.connection, raydiumIdl as Idl)
      // );

      // Example for Lifinity (might not use an IDL in the same way or have a simpler one)
      // this.parserMap.set(
      //   LIFINITY_PROGRAM_ID.toBase58(),
      //   new LifinityParser(LIFINITY_PROGRAM_ID, this.connection, {} as Idl) // Pass a minimal IDL if not used
      // );


      // **Add your custom DEX parser**
      // Ensure you have your IDL loaded or accessible here if needed by your parser's constructor
      // const myCustomDexIdl = this.idls.get(CUSTOM_DEX_PROGRAM_ID.toBase58()) || MyCustomDexIDL_fallback; // Or however you manage IDLs

      // If your parser requires an IDL:
      // this.parserMap.set(
      //  CUSTOM_DEX_PROGRAM_ID.toBase58(),
      //  new MyCustomDexParser(CUSTOM_DEX_PROGRAM_ID, this.connection, myCustomDexIdl as Idl)
      // );

      // If your parser does not strictly require a complex IDL for its operations (e.g., manual decoding):
      // You might pass a simple placeholder or a minimal IDL structure if the BaseParser expects it.
      this.parserMap.set(
        CUSTOM_DEX_PROGRAM_ID.toBase58(),
        new MyCustomDexParser(CUSTOM_DEX_PROGRAM_ID, this.connection, {} as Idl) // Example: pass empty IDL if not used by this specific parser
      );
      
      // console.log(`Registered MyCustomDexParser for program ID: ${CUSTOM_DEX_PROGRAM_ID.toBase58()}`);
    }
    ```

    **Important Considerations:**

    *   **IDL Management:** Pay attention to how IDLs are loaded and passed to parsers. Your `MyCustomDexParser` constructor expects an IDL. If you don't have a formal IDL, or if your parser does manual decoding, you might pass a placeholder like `{}` cast as `Idl`, but ensure your parser handles this gracefully.
    *   **Program ID:** Make sure `CUSTOM_DEX_PROGRAM_ID` is correctly imported from your constants and matches the ID your parser is designed for.
    *   **`parseLiquidityMap`:** If your application has a separate map or logic for liquidity-focused parsers (e.g., `parseLiquidityMap`), and your custom DEX parser handles liquidity events, you would add it there as well, following a similar pattern.

    ```typescript
    // Example if a separate liquidity parser map exists:
    // private parseLiquidityMap: Map<string, BaseParser>; // Or a specific liquidity parser type

    // In constructor or initialization:
    // if (MyCustomDexParser handles liquidity) {
    //   this.parseLiquidityMap.set(
    //     CUSTOM_DEX_PROGRAM_ID.toBase58(),
    //     new MyCustomDexParser(CUSTOM_DEX_PROGRAM_ID, this.connection, myCustomDexIdl as Idl)
    //     // Or use the instance from parserMap if it's the same
    //     // this.parseLiquidityMap.set(CUSTOM_DEX_PROGRAM_ID.toBase58(), this.parserMap.get(CUSTOM_DEX_PROGRAM_ID.toBase58()));
    //   );
    // }
    ```

### Verification

After these changes:

1.  **Rebuild/Recompile:** Ensure your project compiles without errors.
2.  **Test:** When the `DexParser` service (or equivalent) encounters a transaction involving `CUSTOM_DEX_PROGRAM_ID`, it should now select and use your `MyCustomDexParser` to process it. Check your application's output or logs to confirm your parser is being invoked.

By correctly registering your parser, you enable the system to dynamically use your custom logic for the specified DEX, making the parsing framework extensible.

## Define Custom Types (If Necessary)

While the existing `src/types/index.ts` provides many common interfaces like `ITrade` and `ILiquidityChange`, your custom DEX might have unique data structures, event types, or configurations that are not covered. In such cases, you'll need to define your own custom types.

### When to Define Custom Types

*   **Unique Instruction Arguments:** If your DEX instructions have parameters with complex structures specific to your DEX, you might want to type them.
*   **Specific Event Data:** Beyond a standard trade, your DEX might emit events with unique fields (e.g., a governance event, a rebasing event, specific fee structures not in `ITrade`).
*   **Account State Structures:** If your parser needs to fetch and interpret on-chain account states that have a structure unique to your DEX, defining types for these states can be very helpful.
*   **Configuration Objects:** If your parser or its helpers require specific configuration objects.

Defining types enhances code readability, maintainability, and provides type safety during development.

### How to Define Custom Types

1.  **Create a New Type Definition File (Optional but Recommended for Clarity):**

    If your custom types are numerous or complex, it's good practice to create a new file within the `src/types/` directory. Name it descriptively, for example, `my-custom-dex.ts`.

    **Example Structure:**

    ```
    src/
    └── types/
        ├── index.ts
        ├── common.ts
        ├── raydium.ts   // Example for existing DEX-specific types
        └── my-custom-dex.ts // <-- Your new types file
    ```

2.  **Define Your Interfaces/Types:**

    Inside your new file (e.g., `src/types/my-custom-dex.ts`) or directly in `src/types/index.ts` if they are very few and simple, define your custom interfaces or types using TypeScript.

    **Example: `src/types/my-custom-dex.ts`**

    ```typescript
    // src/types/my-custom-dex.ts

    import { PublicKey } from '@solana/web3.js';

    // Example: Custom structure for a specific type of fee reported by your DEX
    export interface IMyCustomDexFeeDetails {
      feeTierName: string;
      rate: number; // e.g., 0.0025 for 0.25%
      mint: PublicKey;
      amount: number;
    }

    // Example: Custom event emitted by your DEX that isn't a standard trade or liquidity change
    export interface IMyCustomDexSpecialEvent {
      eventId: string;
      timestamp: Date;
      eventType: 'Rebalance' | 'NewMarketListed';
      marketAddress?: PublicKey;
      details: Record<string, any>; // Or a more specific type
    }

    // Example: Type for a decoded instruction specific to your DEX, if not using Anchor IDL types directly
    export interface IDecodedMyDexSwapInstructionArgs {
      userAuthority: PublicKey;
      sourceTokenAccount: PublicKey;
      destinationTokenAccount: PublicKey;
      inputAmount: bigint; // Using bigint for u64
      minimumOutputAmount: bigint; // Using bigint for u64
      // ... other specific fields
    }

    // You can also define enums or utility types
    export enum MyCustomDexMarketStatus {
      Active = 0,
      Paused = 1,
      Delisted = 2,
    }
    ```

3.  **Export from `src/types/index.ts`:**

    To make your custom types easily accessible throughout the application, export them from the main `src/types/index.ts` file.

    **Edit `src/types/index.ts`:**

    If you created a separate file like `my-custom-dex.ts`:

    ```typescript
    // src/types/index.ts

    export * from './common'; // Existing common types
    export * from './raydium'; // Example of other DEX-specific types

    // Add this line to export everything from your new types file
    export * from './my-custom-dex';
    ```

    If you added your types directly into `src/types/index.ts`, they are already exported if you used the `export` keyword before their definition.

### Using Custom Types

Once defined and exported, you can import and use these types in your parser (`MyCustomDexParser.ts`), helper functions, or any other relevant part of your integration.

**Example Usage in `MyCustomDexParser.ts`:**

```typescript
// src/parsers/my-custom-dex/MyCustomDexParser.ts
import {
  ITrade,
  // ... other standard types
  IDecodedMyDexSwapInstructionArgs, // Your custom type
  IMyCustomDexFeeDetails,           // Your custom type
} from '../../types'; // Assuming types are exported via src/types/index.ts
import { ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { BaseParser } from '../BaseParser';

export class MyCustomDexParser extends BaseParser {
  // ...

  private async processSwapInstruction(
    decodedInstructionData: IDecodedMyDexSwapInstructionArgs, // Use your custom type
    meta: ParsedTransactionWithMeta['meta'],
    signature: string,
    // ... other params
  ): Promise<ITrade | null> {
    // Now you have type safety for decodedInstructionData
    const amountIn = decodedInstructionData.inputAmount;
    // ...

    // Example of constructing a trade with custom fee details
    const feeDetails: IMyCustomDexFeeDetails = {
      feeTierName: 'standard',
      rate: 0.003,
      mint: new PublicKey("So11111111111111111111111111111111111111112"), // Example SOL mint for fee
      amount: Number(amountIn) * 0.003, // Simplified fee calculation
    };

    const trade: ITrade = {
      // ... standard ITrade fields
      // You might extend ITrade or add fee details to a different field if ITrade doesn't support it directly
      // For example, if ITrade has an optional 'customFeeDetails' field:
      // customFeeDetails: feeDetails,
    };
    // ...
    return trade;
  }
}
```

By defining custom types, you improve the robustness and clarity of your DEX integration code, making it easier to understand, debug, and extend in the future.

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

## Review and Refine

After implementing and initially testing your custom DEX parser, the final step is to thoroughly review and refine your work. This ensures your integration is robust, maintainable, and adheres to project standards.

### 1. Comprehensive Code Review

*   **Self-Review:**
    *   Read through your entire parser logic (`MyCustomDexParser.ts`), type definitions (`src/types/my-custom-dex.ts` if created), and any helper functions.
    *   Check for clarity, correctness, and completeness.
    *   Are variable and function names descriptive?
    *   Is the code well-commented, especially complex sections?
    *   Have you removed any debug `console.log` statements or commented-out code that's no longer needed?
*   **Peer Review (If Possible):**
    *   If you're working in a team, ask a colleague to review your code. A fresh pair of eyes can often spot issues or areas for improvement you might have missed.
    *   Explain your parser's logic and how it handles different transaction types.

### 2. Rigorous Testing

*   **Re-run All Tests:** Ensure all your tests (e.g., in `my-custom-dex.parser.test.ts`) are passing.
*   **Test with Mainnet Data (If Possible and Safe):**
    *   If your initial tests used devnet or testnet transactions, try to find equivalent mainnet transaction signatures (for already executed, historical transactions). This helps verify against real-world conditions. **Do not execute live mainnet transactions that risk funds as part of this testing.**
    *   Use a mainnet RPC endpoint for fetching these transactions. Remember that mainnet data can be very large.
*   **Edge Case Testing:**
    *   **Zero Amounts:** How does your parser handle swaps or liquidity events where an amount might legitimately be zero (if possible in your DEX)?
    *   **New/Unknown Tokens:** While `getTokenInfoByMint` helps, what happens if a token mint is brand new and not yet in metadata services? Does your parser handle missing symbols or decimals gracefully (e.g., defaults to "UNK" or 0)?
    *   **Failed Transactions:** Does your parser correctly ignore or identify failed instructions/transactions? Transaction metadata (`tx.meta.err`) can indicate failures. Your parser should ideally not produce events from failed DEX operations.
    *   **Complex Transactions:** Test with transactions that might involve multiple swaps, or swaps combined with other operations. Ensure your parser correctly identifies and attributes events to your DEX.
    *   **Reverts:** Consider transactions where an inner instruction (like a token transfer) might be reverted. `getTransfersForInstruction` should ideally handle this, but verify.
    *   **Instruction Ordering:** If your DEX can have multiple relevant instructions in one transaction, ensure they are processed correctly and in the intended order if dependencies exist.

### 3. Code Style and Consistency

*   **Adhere to Project Conventions:**
    *   Ensure your code formatting (indentation, spacing, line breaks) matches the existing codebase. Use linters (e.g., ESLint) and formatters (e.g., Prettier) if they are set up in the project.
    *   Follow naming conventions used elsewhere in the project for variables, functions, classes, and files.
*   **TypeScript Best Practices:**
    *   Use strong typing wherever possible. Avoid `any` unless absolutely necessary and document why.
    *   Utilize `readonly` for properties that should not be modified after initialization.
    *   Use enums for sets of related constants.

### 4. Documentation Review

*   **Parser Documentation (Comments):** Ensure your parser class and complex methods have clear JSDoc comments explaining their purpose, parameters, and return values.
*   **Constants and Types:** If you added new constants or types, ensure they are well-named and, if necessary, commented.
*   **Update Main Documentation (If Applicable):** If your integration requires users to take specific steps (e.g., unique environment variables, specific IDL handling), ensure this is mentioned in the project's main README or integration guide.

### 5. Dependency Management

*   **Minimize New Dependencies:** Only add new external libraries if they are essential and provide significant benefits.
*   **Use Approved Versions:** If the project has a standard set of library versions, adhere to them.

### 6. Performance Considerations (If Applicable)

*   For most transaction parsing, performance is not a major issue. However, if your parser involves very complex computations or numerous async calls for a single instruction:
    *   Profile your parser with representative transactions.
    *   Look for opportunities to optimize (e.g., batching RPC calls if feasible, though often not applicable per instruction).

### 7. Consider Contributing Back (If Open Source)

*   If you've built a parser for a publicly known DEX and the project is open source:
    *   Consider contributing your parser back to the main project. This benefits the wider community.
    *   Follow the project's contribution guidelines (e.g., fork the repository, create a pull request, sign a CLA if required).
    *   Be prepared to discuss your implementation with maintainers and make adjustments based on their feedback.

### Final Checklist:

*   [ ] All custom code (parser, types, constants) reviewed for clarity and correctness.
*   [ ] All tests pass, including those for edge cases.
*   [ ] Code style is consistent with the project.
*   [ ] Necessary comments and documentation are in place.
*   [ ] No unnecessary `console.log` or debug code.
*   [ ] Dependencies are managed appropriately.
*   [ ] (If contributing back) Prepared pull request according to project guidelines.

By taking the time to review and refine, you ensure your custom DEX parser is a high-quality addition that is both functional and easy for others (and your future self) to understand and maintain.

---

By following these steps, you can effectively integrate a parser for a new DEX into the system. Remember that each DEX is unique, so adapt the examples and logic to fit the specific requirements of your target DEX. Thorough understanding of the DEX's on-chain behavior and meticulous testing are key to a successful integration.
Good luck!

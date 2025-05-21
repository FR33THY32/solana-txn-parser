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
```

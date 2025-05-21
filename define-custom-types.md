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
```

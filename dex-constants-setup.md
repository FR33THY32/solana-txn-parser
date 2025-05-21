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

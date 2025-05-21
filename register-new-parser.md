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
```

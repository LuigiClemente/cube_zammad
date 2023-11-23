 ```mermaid
graph TD
  subgraph "Application"
    subgraph "Elasticsearch Index (usuarioIndex)"
      A[encode: lowercase, split by non-word characters]
      B[tokenize: strict]
      C[Cache: true]
      D[Document Fields: tipo_usuario, nome_dieta, ...]
      E[Create Index]
      F[Add Entry with user_id]
    end
  end

  subgraph "Data Source"
    G[User ID: 123]
    H[Usuario Data]
  end

  A --> B --> C --> D --> E --> F
  G --> H --> F
```

### Step 1: Create Tokenizer Utility

Create a file named `tokenizer.ts`:

```typescript
// tokenizer.ts

interface TokenizerOptions {
  caseSensitive?: boolean;
}

class Tokenizer {
  private options: TokenizerOptions;

  constructor(options: TokenizerOptions = {}) {
    this.options = { caseSensitive: options.caseSensitive || false };
  }

  tokenize(input: string): string[] {
    // Remove special characters and split the input string into words
    const cleanedInput = this.cleanInput(input);
    const tokens = cleanedInput.split(/\s+/);

    // Apply case sensitivity based on options
    const caseTransform = this.options.caseSensitive ? (token: string) => token : (token: string) => token.toLowerCase();
    return tokens.map(caseTransform);
  }

  private cleanInput(input: string): string {
    // Remove special characters and convert to lowercase if case-insensitive
    const cleanedInput = input.replace(/[^\w\s]/g, '');
    return this.options.caseSensitive ? cleanedInput : cleanedInput.toLowerCase();
  }
}

export default Tokenizer;
```

### Step 2: Create Example Usage File

Create a file named `example.ts` to demonstrate the usage of the advanced tokenizer:

```typescript
// example.ts

import Tokenizer from './tokenizer';

// Example usage
const inputSentence = 'This is a sample sentence with Special!Characters, for Tokenization';
const options = { caseSensitive: false };

// Create a tokenizer instance with options
const tokenizer = new Tokenizer(options);

// Tokenize the input sentence
const tokens = tokenizer.tokenize(inputSentence);

// Display the result
console.log('Input Sentence:', inputSentence);
console.log('Tokens:', tokens);
```

### Step 3: Compile and Run

Compile your TypeScript files using:

```bash
tsc
```

This will generate JavaScript files from your TypeScript code.

Run the compiled JavaScript file:

```bash
node example.js
```

### Full Documentation

#### `Tokenizer` Class

##### `constructor(options: TokenizerOptions)`

* **Parameters:**
    * `options` (optional): Object with tokenization options.
        * `caseSensitive` (optional, default: `false`): Whether tokenization should be case-sensitive.

##### `tokenize(input: string): string[]`

* **Parameters:**
    * `input`: The input string to tokenize.
* **Returns:**
    * An array of tokens.

#### `TokenizerOptions` Interface

* `caseSensitive` (optional): Whether tokenization should be case-sensitive. Default is `false`.

### Advanced Tokenization

The `Tokenizer` class now supports case sensitivity and removes special characters during tokenization. 


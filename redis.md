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

### Step 1: Install Redis Package

Firstly, install the `redis` package using npm:

```bash
npm install --save redis
```

### Step 2: Set Up Redis Client

Create a file to set up the Redis client. For simplicity, let's name it `redisClient.ts`:

```typescript
// src/redisClient.ts

import * as Redis from 'redis';

// Create Redis client
export const redisClient = Redis.createClient({
  host: 'localhost', // Replace with your Redis server information
  port: 6379, // Default Redis port
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Export the Redis client for use in other modules
export default redisClient;
```

### Step 3: Cache Data in Redis

Modify your existing `indexAlimentoData.ts` file to include Redis caching:

```typescript
// src/indexAlimentoData.ts

import { client, indexName } from './alimentoElasticsearch';
import { Alimento } from './interfaces';
import redisClient from './redisClient';

export async function indexAlimentoData(user_id: number, alimento_data: Alimento) {
  // Check if data exists in Redis cache
  redisClient.get(user_id.toString(), async (error, cachedData) => {
    if (error) {
      console.error('Redis Error:', error);
    }

    if (cachedData) {
      console.log('Data retrieved from Redis cache');
      // Use cached data instead of indexing to Elasticsearch again
      return JSON.parse(cachedData);
    } else {
      // Index data in Elasticsearch
      await client.index({
        index: indexName,
        id: user_id.toString(),
        body: alimento_data,
      });

      // Cache data in Redis for future use (expire time can be adjusted)
      redisClient.setex(user_id.toString(), 3600, JSON.stringify(alimento_data));

      console.log('Data indexed in Elasticsearch and cached in Redis');
    }
  });
}
```

### Step 4: Update Example Usage

Modify your `alimentoExample.ts` file to include Redis-cached data retrieval:

```typescript
// src/alimentoExample.ts

import { createIndex } from './alimentoElasticsearch';
import { indexAlimentoData } from './indexAlimentoData';
import { Alimento } from './interfaces';

// Example usage
const user_id = 123;

const alimento_data: Alimento = {
  id_alimento: 'xyz123',
  nome_alimento: 'Apple',
  descrição_alimento: 'Description of Apple',
  calorias: 50,
  // ... (other fields)
};

// Ensure the index is created before indexing data
createIndex().then(() => {
  // Index alimento data with user's id
  indexAlimentoData(user_id, alimento_data);

  // Try retrieving data from Redis cache
  setTimeout(() => {
    indexAlimentoData(user_id, alimento_data);
  }, 2000); // Simulating a delay for the second retrieval
});
```

### Step 5: Run the Example

Run the example file again:

```bash
ts-node src/alimentoExample.ts
```

### Step 1: Set Up Redis Client for Analise

Create a file named `redisAnaliseClient.ts` to set up the Redis client for Analise:

```typescript
// src/redisAnaliseClient.ts

import * as Redis from 'redis';

// Create Redis client for Analise
export const redisAnaliseClient = Redis.createClient({
  host: 'localhost', // Replace with your Redis server information
  port: 6379, // Default Redis port
});

// Handle Redis connection errors
redisAnaliseClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Export the Redis client for Analise for use in other modules
export default redisAnaliseClient;
```

### Step 2: Update Analise Elasticsearch Implementation

Modify the `analiseElasticsearch.ts` file to include Redis caching for Analise:

```typescript
// src/analiseElasticsearch.ts

import { Client } from '@elastic/elasticsearch';
import redisAnaliseClient from './redisAnaliseClient'; // Import the Redis client for Analise

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const analiseIndexName = 'analise_index';

export async function createAnaliseIndex() {
  await client.indices.create({
    index: analiseIndexName,
    body: {
      mappings: {
        properties: {
          // ... (same properties as defined in interfaces.ts for Analise)
        },
      },
    },
  });
}

export async function indexAnaliseData(user_id: number, analise_data: Analise) {
  // Check if data exists in Redis cache for Analise
  redisAnaliseClient.get(user_id.toString(), async (error, cachedData) => {
    if (error) {
      console.error('Redis Error:', error);
    }

    if (cachedData) {
      console.log('Data retrieved from Redis cache for Analise');
      // Use cached data instead of indexing to Elasticsearch again
      return JSON.parse(cachedData);
    } else {
      // Index data in Elasticsearch for Analise
      await client.index({
        index: analiseIndexName,
        id: user_id.toString(),
        body: analise_data,
      });

      // Cache data in Redis for Analise for future use (expire time can be adjusted)
      redisAnaliseClient.setex(user_id.toString(), 3600, JSON.stringify(analise_data));

      console.log('Data indexed in Elasticsearch and cached in Redis for Analise');
    }
  });
}
```

### Step 3: Update Analise Example Usage

Modify the `analiseExample.ts` file to include Redis-cached data retrieval for Analise:

```typescript
// src/analiseExample.ts

import { createAnaliseIndex } from './analiseElasticsearch';
import { indexAnaliseData } from './analiseElasticsearch';
import { Analise } from './interfaces';

// Example usage
const user_id = 456;

const analise_data: Analise = {
  // ... (same properties as defined in interfaces.ts for Analise)
};

// Ensure the index is created before indexing data for Analise
createAnaliseIndex().then(() => {
  // Index analise data with user's id for Analise
  indexAnaliseData(user_id, analise_data);

  // Try retrieving data from Redis cache for Analise
  setTimeout(() => {
    indexAnaliseData(user_id, analise_data);
  }, 2000); // Simulating a delay for the second retrieval
});
```

### Step 4: Run the Updated Example

Run the updated example file for Analise:

```bash
ts-node src/analiseExample.ts
```
### Step 1: Set Up Redis Client for Refeicao

Create a file named `redisRefeicaoClient.ts` to set up the Redis client for Refeicao:

```typescript
// src/redisRefeicaoClient.ts

import * as Redis from 'redis';

// Create Redis client for Refeicao
export const redisRefeicaoClient = Redis.createClient({
  host: 'localhost', // Replace with your Redis server information
  port: 6379, // Default Redis port
});

// Handle Redis connection errors
redisRefeicaoClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Export the Redis client for Refeicao for use in other modules
export default redisRefeicaoClient;
```

### Step 2: Update Refeicao Elasticsearch Implementation

Modify the `refeicaoElasticsearch.ts` file to include Redis caching for Refeicao:

```typescript
// src/refeicaoElasticsearch.ts

import { Client } from '@elastic/elasticsearch';
import redisRefeicaoClient from './redisRefeicaoClient'; // Import the Redis client for Refeicao

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const refeicaoIndexName = 'refeicao_index';

export async function createRefeicaoIndex() {
  await client.indices.create({
    index: refeicaoIndexName,
    body: {
      mappings: {
        properties: {
          // ... (same properties as defined in interfaces.ts for Refeicao)
        },
      },
    },
  });
}

export async function indexRefeicaoData(user_id: number, refeicao_data: Refeicao) {
  // Check if data exists in Redis cache for Refeicao
  redisRefeicaoClient.get(user_id.toString(), async (error, cachedData) => {
    if (error) {
      console.error('Redis Error:', error);
    }

    if (cachedData) {
      console.log('Data retrieved from Redis cache for Refeicao');
      // Use cached data instead of indexing to Elasticsearch again
      return JSON.parse(cachedData);
    } else {
      // Index data in Elasticsearch for Refeicao
      await client.index({
        index: refeicaoIndexName,
        id: user_id.toString(),
        body: refeicao_data,
      });

      // Cache data in Redis for Refeicao for future use (expire time can be adjusted)
      redisRefeicaoClient.setex(user_id.toString(), 3600, JSON.stringify(refeicao_data));

      console.log('Data indexed in Elasticsearch and cached in Redis for Refeicao');
    }
  });
}
```

### Step 3: Update Refeicao Example Usage

Modify the `refeicaoExample.ts` file to include Redis-cached data retrieval for Refeicao:

```typescript
// src/refeicaoExample.ts

import { createRefeicaoIndex } from './refeicaoElasticsearch';
import { indexRefeicaoData } from './refeicaoElasticsearch';
import { Refeicao } from './interfaces';

// Example usage
const user_id = 789;

const refeicao_data: Refeicao = {
  // ... (same properties as defined in interfaces.ts for Refeicao)
};

// Ensure the index is created before indexing data for Refeicao
createRefeicaoIndex().then(() => {
  // Index refeicao data with user's id for Refeicao
  indexRefeicaoData(user_id, refeicao_data);

  // Try retrieving data from Redis cache for Refeicao
  setTimeout(() => {
    indexRefeicaoData(user_id, refeicao_data);
  }, 2000); // Simulating a delay for the second retrieval
});
```

### Step 4: Run the Updated Example

Run the updated example file for Refeicao:

```bash
ts-node src/refeicaoExample.ts
```

### Step 1: Set Up Redis Client for Usuario

Create a file named `redisUsuarioClient.ts` to set up the Redis client for Usuario:

```typescript
// src/redisUsuarioClient.ts

import * as Redis from 'redis';

// Create Redis client for Usuario
export const redisUsuarioClient = Redis.createClient({
  host: 'localhost', // Replace with your Redis server information
  port: 6379, // Default Redis port
});

// Handle Redis connection errors
redisUsuarioClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Export the Redis client for Usuario for use in other modules
export default redisUsuarioClient;
```

### Step 2: Update Usuario Elasticsearch Implementation

Modify the `usuarioElasticsearch.ts` file to include Redis caching for Usuario:

```typescript
// src/usuarioElasticsearch.ts

import { Client } from '@elastic/elasticsearch';
import redisUsuarioClient from './redisUsuarioClient'; // Import the Redis client for Usuario

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const usuarioIndexName = 'usuario_index';

export async function createUsuarioIndex() {
  await client.indices.create({
    index: usuarioIndexName,
    body: {
      mappings: {
        properties: {
          // ... (same properties as defined in interfaces.ts for Usuario)
        },
      },
    },
  });
}

export async function indexUsuarioData(user_id: number, usuario_data: Usuario) {
  // Check if data exists in Redis cache for Usuario
  redisUsuarioClient.get(user_id.toString(), async (error, cachedData) => {
    if (error) {
      console.error('Redis Error:', error);
    }

    if (cachedData) {
      console.log('Data retrieved from Redis cache for Usuario');
      // Use cached data instead of indexing to Elasticsearch again
      return JSON.parse(cachedData);
    } else {
      // Index data in Elasticsearch for Usuario
      await client.index({
        index: usuarioIndexName,
        id: user_id.toString(),
        body: usuario_data,
      });

      // Cache data in Redis for Usuario for future use (expire time can be adjusted)
      redisUsuarioClient.setex(user_id.toString(), 3600, JSON.stringify(usuario_data));

      console.log('Data indexed in Elasticsearch and cached in Redis for Usuario');
    }
  });
}
```

### Step 3: Update Usuario Example Usage

Modify the `usuarioExample.ts` file to include Redis-cached data retrieval for Usuario:

```typescript
// src/usuarioExample.ts

import { createUsuarioIndex } from './usuarioElasticsearch';
import { indexUsuarioData } from './usuarioElasticsearch';
import { Usuario } from './interfaces';

// Example usage
const user_id = 123;

const usuario_data: Usuario = {
  // ... (same properties as defined in interfaces.ts for Usuario)
};

// Ensure the index is created before indexing data for Usuario
createUsuarioIndex().then(() => {
  // Index usuario data with user's id for Usuario
  indexUsuarioData(user_id, usuario_data);

  // Try retrieving data from Redis cache for Usuario
  setTimeout(() => {
    indexUsuarioData(user_id, usuario_data);
  }, 2000); // Simulating a delay for the second retrieval
});
```

### Step 4: Run the Updated Example

Run the updated example file for Usuario:

```bash
ts-node src/usuarioExample.ts
```

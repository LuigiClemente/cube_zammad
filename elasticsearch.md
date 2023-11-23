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


### Step 1: Install Dependencies

Firstly, install the necessary packages:

```bash
npm install --save @elastic/elasticsearch
```

### Step 2: Define Interfaces

Create TypeScript interfaces for the Alimento entity and UserData:

```typescript
// src/interfaces.ts

interface Alimento {
  id_alimento: string;
  nome_alimento: string;
  descrição_alimento: string;
  calorias: number;
  proteínas: number;
  carboidratos: number;
  gorduras: number;
  valor_energetico: number;
  tamanho_porção: string;
  nutrientes: string;
  fonte: string;
  instruções_preparo: string;
  requisitos_armazenamento: string;
  índice_glicêmico: number;
  carga_glicemia: number;
  fibra: number;
  imagem_alimento: string;
  individual_grade: string;
  combined_grade: string;
  created_at: Date;
  updated_at: Date;
  active: boolean;
  excluido_em: Date | null;
  arquivado: boolean;
  created_by_id: number;
  updated_by_id: number;
}

interface UserData {
  // ... (as per Zammad UserData)
}
```

### Step 3: Set Up Elasticsearch Client and Index Configuration

Create a file to set up the Elasticsearch client and define the index configuration:

```typescript
// src/alimentoElasticsearch.ts

import { Client } from '@elastic/elasticsearch';

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const indexName = 'alimento_index';

export async function createIndex() {
  await client.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          // ... (same properties as defined in interfaces.ts for Alimento)
        },
      },
    },
  });
}
```

### Step 4: Index Data in Elasticsearch

Create a file to handle indexing data in Elasticsearch:

```typescript
// src/indexAlimentoData.ts

import { client, indexName } from './alimentoElasticsearch';
import { Alimento } from './interfaces';

export async function indexAlimentoData(user_id: number, alimento_data: Alimento) {
  await client.index({
    index: indexName,
    id: user_id.toString(),
    body: alimento_data,
  });
}
```

### Step 5: Example Usage

Finally, create an example file to use the defined functions:

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
});
```

### Step 6: Run the Example

Run the example file:

```bash
ts-node src/alimentoExample.ts
```
### Step 1: Define Interfaces

Create TypeScript interfaces for the Analise entity:

```typescript
// src/interfaces.ts

interface Analise {
  id_analise: string;
  id_dieta: string;
  data_analise: Date;
  provedor_analise: string;
  resultados_analise: string;
  recomendações_analise: string;
  carimbo_analise: Date;
  tipo_analise: string;
  parâmetros_analisados: string;
  faixas_referencia: string;
  custo_analise: number;
  interpretação_analise: string;
  datas_referencia_resultados: Date;
  duração_refeição: string;
  estado_emocional_refeição: string;
  created_at: Date;
  updated_at: Date;
  excluido_em: Date | null;
  arquivado: boolean;
  created_by_id: number;
  updated_by_id: number;
}
```

### Step 2: Set Up Elasticsearch Implementation

Create a file to handle Elasticsearch operations for the "analise" entity:

```typescript
// src/analiseElasticsearch.ts

import { Client } from '@elastic/elasticsearch';

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const analiseIndexName = 'analise_index';

export async function createAnaliseIndex() {
  await client.indices.create({
    index: analiseIndexName,
    body: {
      mappings: {
        properties: {
          id_analise: { type: 'keyword' },
          id_dieta: { type: 'keyword' },
          data_analise: { type: 'date' },
          provedor_analise: { type: 'text' },
          resultados_analise: { type: 'text' },
          recomendações_analise: { type: 'text' },
          carimbo_analise: { type: 'date' },
          tipo_analise: { type: 'text' },
          parâmetros_analisados: { type: 'text' },
          faixas_referencia: { type: 'text' },
          custo_analise: { type: 'float' },
          interpretação_analise: { type: 'text' },
          datas_referencia_resultados: { type: 'date' },
          duração_refeição: { type: 'text' },
          estado_emocional_refeição: { type: 'text' },
          created_at: { type: 'date' },
          updated_at: { type: 'date' },
          excluido_em: { type: 'date' },
          arquivado: { type: 'boolean' },
          created_by_id: { type: 'integer' },
          updated_by_id: { type: 'integer' },
        },
      },
    },
  });
}

export async function indexAnaliseData(user_id: number, analise_data: Analise) {
  await client.index({
    index: analiseIndexName,
    id: user_id.toString(),
    body: analise_data,
  });
}
```

### Step 3: Example Usage

Create an example file to use the defined functions:

```typescript
// src/analiseExample.ts

import { createAnaliseIndex } from './analiseElasticsearch';
import { indexAnaliseData } from './analiseElasticsearch';
import { Analise } from './interfaces';

// Example usage
const user_id = 456;

const analise_data: Analise = {
  id_analise: 'abc456',
  id_dieta: 'xyz789',
  data_analise: new Date(),
  provedor_analise: 'Health Lab',
  resultados_analise: 'Positive',
  recomendações_analise: 'Follow a balanced diet.',
  carimbo_analise: new Date(),
  tipo_analise: 'Blood Test',
  parâmetros_analisados: 'Cholesterol, Glucose',
  faixas_referencia: 'Normal',
  custo_analise: 150.5,
  interpretação_analise: 'Results are within normal range.',
  datas_referencia_resultados: new Date(),
  duração_refeição: '30 minutes',
  estado_emocional_refeição: 'Happy',
  created_at: new Date(),
  updated_at: new Date(),
  excluido_em: null,
  arquivado: false,
  created_by_id: 789,
  updated_by_id: 101,
};

// Ensure the index is created before indexing data
createAnaliseIndex().then(() => {
  // Index analise data with user's id
  indexAnaliseData(user_id, analise_data);
});
```

### Step 4: Run the Example

Run the example file:

```bash
ts-node src/analiseExample.ts
```
### Step 1: Define Interfaces

Create TypeScript interfaces for the Refeicao entity:

```typescript
// src/interfaces.ts

interface Refeicao {
  id_refeição: string;
  id_dieta: string;
  nome_refeição: string;
  tipo_refeição: string;
  hora_refeição: string;
  local_refeição: string;
  companheiros_refeição: string;
  humor_refeição: string;
  nível_satisfação: string;
  notas_refeição: string;
  nível_fome_antes_refeição: string;
  nível_fome_após_refeição: string;
  custo_refeição: number;
  tempo_preparo_refeição: string;
  duração_refeição: string;
  estado_emocional_refeição: string;
  created_at: Date;
  updated_at: Date;
  active: boolean;
  excluido_em: Date | null;
  arquivado: boolean;
  created_by_id: number;
  updated_by_id: number;
}
```

### Step 2: Set Up Elasticsearch Implementation

Create a file to handle Elasticsearch operations for the "refeicao" entity:

```typescript
// src/refeicaoElasticsearch.ts

import { Client } from '@elastic/elasticsearch';

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const refeicaoIndexName = 'refeicao_index';

export async function createRefeicaoIndex() {
  await client.indices.create({
    index: refeicaoIndexName,
    body: {
      mappings: {
        properties: {
          id_refeição: { type: 'keyword' },
          id_dieta: { type: 'keyword' },
          nome_refeição: { type: 'text' },
          tipo_refeição: { type: 'text' },
          hora_refeição: { type: 'text' },
          local_refeição: { type: 'text' },
          companheiros_refeição: { type: 'text' },
          humor_refeição: { type: 'text' },
          nível_satisfação: { type: 'text' },
          notas_refeição: { type: 'text' },
          nível_fome_antes_refeição: { type: 'text' },
          nível_fome_após_refeição: { type: 'text' },
          custo_refeição: { type: 'float' },
          tempo_preparo_refeição: { type: 'text' },
          duração_refeição: { type: 'text' },
          estado_emocional_refeição: { type: 'text' },
          created_at: { type: 'date' },
          updated_at: { type: 'date' },
          active: { type: 'boolean' },
          excluido_em: { type: 'date' },
          arquivado: { type: 'boolean' },
          created_by_id: { type: 'integer' },
          updated_by_id: { type: 'integer' },
        },
      },
    },
  });
}

export async function indexRefeicaoData(user_id: number, refeicao_data: Refeicao) {
  await client.index({
    index: refeicaoIndexName,
    id: user_id.toString(),
    body: refeicao_data,
  });
}
```

### Step 3: Example Usage

Create an example file to use the defined functions:

```typescript
// src/refeicaoExample.ts

import { createRefeicaoIndex } from './refeicaoElasticsearch';
import { indexRefeicaoData } from './refeicaoElasticsearch';
import { Refeicao } from './interfaces';

// Example usage
const user_id = 789;

const refeicao_data: Refeicao = {
  id_refeição: 'def789',
  id_dieta: 'uvw012',
  nome_refeição: 'Dinner',
  tipo_refeição: 'Main Course',
  hora_refeição: '20:00',
  local_refeição: 'Home',
  companheiros_refeição: 'Family',
  humor_refeição: 'Happy',
  nível_satisfação: 'Satisfied',
  notas_refeição: 'Delicious!',
  nível_fome_antes_refeição: 'Moderate',
  nível_fome_após_refeição: 'Full',
  custo_refeição: 25.75,
  tempo_preparo_refeição: '30 minutes',
  duração_refeição: '45 minutes',
  estado_emocional_refeição: 'Content',
  created_at: new Date(),
  updated_at: new Date(),
  active: true,
  excluido_em: null,
  arquivado: false,
  created_by_id: 123,
  updated_by_id: 456,
};

// Ensure the index is created before indexing data
createRefeicaoIndex().then(() => {
  // Index refeicao data with user's id
  indexRefeicaoData(user_id, refeicao_data);
});
```

### Step 4: Run the Example

Run the example file:

```bash
ts-node src/refeicaoExample.ts
```
### Step 1: Define Interfaces

Create TypeScript interfaces for the Usuario entity:

```typescript
// src/interfaces.ts

interface Usuario {
  tipo_usuario: string;
  nome_dieta: string;
  data_refeição: string;
  tipo_dieta: string;
  descrição_dieta: string;
  hora_inicio_refeição: string;
  hora_fim_refeição: string;
  peso_usuario: number;
  altura_usuario: number;
  nível_atividade: string;
  meta_dieta: string;
  meta_dieta_especifica: string;
  restrições_dietéticas: string;
  preferencias_alimentares: string;
  medicamentos_atuais: string;
  histórico_medico: string;
  coluna_analise_1: string;
  coluna_analise_2: string;
  coluna_analise_3: string;
  peso_atual: number;
  imc: number;
  circunferencia_cintura: number;
  pressão_sanguínea: string;
  calorias: number;
  proteínas: number;
  carboidratos: number;
  gorduras: number;
  valor_energético: number;
  id_alimento: string;
  id_refeição: string;
  data_inicio_dieta: string;
  data_fim_dieta: string;
  metas: string;
  alimentos_recomendados: string;
  alimentos_evitados: string;
  gênero: string;
  data_nascimento: string;
  nível_atividade_usuário: string;
  objetivos_saude: string;
  percentual_gordura: number;
  biografia_usuário: string;
  nível_satisfação_refeições: string;
  feedback_refeições: string;
  data_inicio_dieta: string;
  data_fim_dieta: string;
  objetivos_saúde_específicos: string;
  coluna_analise_1: string;
  coluna_analise_2: string;
  coluna_analise_3: string;
  histórico_peso: string;
  criado_em: Date;
  atualizado_em: Date;
  active: boolean;
  archived: boolean;
  created_by_id: number;
  updated_by_id: number;
}
```

### Step 2: Set Up Elasticsearch Implementation

Create a file to handle Elasticsearch operations for the "usuario" entity:

```typescript
// src/usuarioElasticsearch.ts

import { Client } from '@elastic/elasticsearch';

export const client = new Client({ node: 'http://localhost:9200' }); // Replace with your Elasticsearch server information

export const usuarioIndexName = 'usuario_index';

export async function createUsuarioIndex() {
  await client.indices.create({
    index: usuarioIndexName,
    body: {
      mappings: {
        properties: {
          tipo_usuario: { type: 'keyword' },
          nome_dieta: { type: 'text' },
          data_refeição: { type: 'date' },
          tipo_dieta: { type: 'text' },
          descrição_dieta: { type: 'text' },
          hora_inicio_refeição: { type: 'text' },
          hora_fim_refeição: { type: 'text' },
          peso_usuario: { type: 'float' },
          altura_usuario: { type: 'float' },
          nível_atividade: { type: 'keyword' },
          meta_dieta: { type: 'text' },
          meta_dieta_especifica: { type: 'text' },
          restrições_dietéticas: { type: 'text' },
          preferencias_alimentares: { type: 'text' },
          medicamentos_atuais: { type: 'text' },
          histórico_medico: { type: 'text' },
          coluna_analise_1: { type: 'text' },
          coluna_analise_2: { type: 'text' },
          coluna_analise_3: { type: 'text' },
          peso_atual: { type: 'float' },
          imc: { type: 'float' },
          circunferencia_cintura: { type: 'float' },
          pressão_sanguínea: { type: 'text' },
          calorias: { type: 'float' },
          proteínas: { type: 'float' },
          carboidratos: { type: 'float' },
          gorduras: { type: 'float' },
          valor_energético: { type: 'float' },
          id_alimento: { type: 'keyword' },
          id_refeição: { type: 'keyword' },
          data_inicio_dieta: { type: 'date' },
          data_fim_dieta: { type: 'date' },
          metas: { type: 'text' },
          alimentos_recomendados: { type: 'text' },
          alimentos_evitados: { type: 'text' },
          gênero: { type: 'keyword' },
          data_nascimento: { type: 'date' },
          nível_atividade_usuário: { type: 'keyword' },
          objetivos_saude: { type: 'text' },
          percentual_gordura: { type: 'float' },
          biografia_usuário: { type: 'text' },
          nível_satisfação_refeições: { type: 'text' },
          feedback_refeições: { type: 'text' },
          data_inicio_dieta: { type: 'date' },
          data_fim_dieta: { type: 'date' },
          objetivos_saúde_específicos: { type: 'text' },
          coluna_analise_1: { type: 'text' },
          coluna_analise_2: { type: 'text' },
          coluna_analise_3: { type: 'text' },
          histórico_peso: { type: 'text' },
          criado_em: { type: 'date' },
          atualizado_em: { type: 'date' },
          active: { type: 'boolean' },
          archived: { type: 'boolean' },
          created_by_id: { type: 'integer' },
          updated_by_id: { type: 'integer' },
        },
      },
    },
  });
}

export async function indexUsuarioData(user_id: number, usuario_data: Usuario) {
  await client.index({
    index: usuarioIndexName,
    id: user_id.toString(),
    body: usuario_data,
  });
}
```

### Step 3: Example Usage

Create an example file to use the defined functions:

```typescript
// src/usuarioExample.ts

import { createUsuarioIndex } from './usuarioElasticsearch';
import { indexUsuarioData } from './usuarioElasticsearch';
import { Usuario } from './interfaces';

// Example usage
const user_id = 123;

const usuario_data: Usuario = {
  tipo_usuario: 'Cliente',
  nome_dieta: 'Dieta Balanceada',
  data_refeição: '2023-11-23',
  tipo_dieta: 'Low Carb',
  descrição_dieta: 'Dieta rica em fibras',
  hora_inicio_refeição: '12:00',
  hora_fim_refeição: '13:00',
  peso_usuario: 70.5,
  altura_usuario: 175.0,
  nível_atividade: 'Alto',
  meta_dieta: 'Perder peso',
  meta_dieta_especifica: 'Perder 5 kg em 2 meses',
  restrições_dietéticas: 'Nenhuma',
  preferencias_alimentares: 'Vegetariano',
  medicamentos_atuais: 'Nenhum',
  histórico_medico: 'Nenhum problema médico conhecido',
  coluna_analise_1: 'Dado 1',
  coluna_analise_2: 'Dado 2',
  coluna_analise_3: 'Dado 3',
  peso_atual: 72.0,
  imc: 23.4,
  circunferencia_cintura: 85.0,
  pressão_sanguínea: '120/80',
  calorias: 500.0,
  proteínas: 25.0,
  carboidratos: 50.0,
  gorduras: 20.0,
  valor_energético: 300.0,
  id_alimento: 'alimento_1',
  id_refeição: 'refeicao_1',
  data_inicio_dieta: '2023-01-01',
  data_fim_dieta: '2023-03-01',
  metas: '{"meta1": "Alcançar peso ideal", "meta2": "Manter nível de energia"}',
  alimentos_recomendados: '{"alimento1": "Frutas", "alimento2": "Vegetais"}',
  alimentos_evitados: '{"alimento3": "Doces", "alimento4": "Frituras"}',
  gênero: 'Masculino',
  data_nascimento: '1990-05-15',
  nível_atividade_usuário: 'Alto',
  objetivos_saude: 'Melhorar condicionamento físico',
  percentual_gordura: 15.0,
  biografia_usuário: 'Entusiasta de fitness e nutrição',
  nível_satisfação_refeições: 'Satisfeito',
  feedback_refeições: 'Refeições deliciosas e nutritivas',
  data_inicio_dieta: '2023-01-01',
  data_fim_dieta: '2023-03-01',
  objetivos_saúde_específicos: 'Fortalecer músculos e perder gordura',
  coluna_analise_1: 'Dado 1',
  coluna_analise_2: 'Dado 2',
  coluna_analise_3: 'Dado 3',
  histórico_peso: '{"2022-01-01": 75.0, "2022-02-01": 73.5, "2022-03-01": 72.0}',
  criado_em: new Date(),
  atualizado_em: new Date(),
  active: true,
  archived: false,
  created_by_id: 456,
  updated_by_id: 789,
};

// Ensure the index is created before indexing data
createUsuarioIndex().then(() => {
  // Index usuario data with user's id
  indexUsuarioData(user_id, usuario_data);
});
```

### Step 4: Run the Example

Run the example file:

```bash
ts-node src/usuarioExample.ts
```

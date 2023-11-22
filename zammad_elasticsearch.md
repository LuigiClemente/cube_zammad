# Zammad to Elasticsearch Integration using `@gojob/ts-elasticsearch`

This documentation provides a step-by-step guide on how to use the `@gojob/ts-elasticsearch` library to index webhooks from Zammad in Elasticsearch.

## Prerequisites

* Node.js installed on your machine.
* Zammad instance with configured webhooks.
* Elasticsearch instance accessible and configured.

## Installation

Install the `@gojob/ts-elasticsearch` library using [Yarn](https://yarnpkg.com/):

```bash
yarn add @gojob/ts-elasticsearch
```

## Setting up TypeScript Classes for Zammad Data

Create TypeScript classes that represent the structure of Zammad data you want to index in Elasticsearch using decorators provided by the library.

```typescript
// user.model.ts

import { Field, Elasticsearch, Primary, Index } from '@gojob/ts-elasticsearch';

@Index()
class ZammadUser {
  @Primary()
  @Field({ enabled: false })
  id: string;

  @Field('text')
  name: string;

  @Field('integer')
  age: number;
}
```

## Initializing Elasticsearch

Initialize the Elasticsearch client with the appropriate configuration, including the Elasticsearch host.

```typescript
// elasticsearch-setup.ts

import { Elasticsearch } from '@gojob/ts-elasticsearch';

const elasticsearch = new Elasticsearch({ host: 'http://your-elasticsearch-host:9200' });

// Create the index and put mapping for ZammadUser
await elasticsearch.indices.create(ZammadUser);
await elasticsearch.indices.putMapping(ZammadUser);
```

## Processing Zammad Webhooks

Implement logic in your Cube.js application to receive and process Zammad webhooks. Use the `ZammadUser` class to create instances and index the data in Elasticsearch.

```typescript
// zammad-webhook-handler.ts

import { ZammadUser } from './user.model';
import { Elasticsearch } from '@gojob/ts-elasticsearch';

const elasticsearch = new Elasticsearch({ host: 'http://your-elasticsearch-host:9200' });

// Function to handle Zammad webhook payload
async function handleZammadWebhook(payload: any) {
  // Validate and process the payload

  // If valid, create ZammadUser instance and index in Elasticsearch
  const zammadUser = new ZammadUser();
  zammadUser.id = payload.userId;
  zammadUser.name = payload.userName;
  zammadUser.age = payload.userAge;

  await elasticsearch.index(zammadUser);

  // Perform additional logic as needed
}

// Example usage (assuming Cube.js handles incoming webhooks)
const zammadWebhookPayload = /* Get Zammad webhook payload */;
await handleZammadWebhook(zammadWebhookPayload);
```

* [GitHub Repository](https://github.com/gojob/ts-elasticsearch)

* * *

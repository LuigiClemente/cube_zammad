```mermaid
flowchart TD

subgraph Postgres
  pgClient(PostgreSQL Client)
end

subgraph Websocket
  express(Express)
  soketi(Soketi)
end

subgraph VercelCache
  clientVercel(Client Vercel)
  cacheInvalidatedAt(Cache Invalidated At)
end

pgClient --> express
express --> soketi
soketi --> express
soketi --> clientVercel

clientVercel --> soketi

cacheInvalidatedAt --> soketi
cacheInvalidatedAt -.-> express
cacheInvalidatedAt -.-> pgClient
```

# Data Change Detection and Cache Invalidation with Soketi

## Overview

Implementing data change detection mechanism and cache invalidation system using Soketi. To update the cache in the Vercel CDN upon detecting changes in user data. Information on SQL queries and timestamp-based cache invalidation strategy.

## Implementation Steps

### 1. Configuring Soketi with .env

Configure Soketi using environment variables within a .env file.

#### .env File:

Create a .env file with Soketi configuration:

```plaintext
# Soketi configuration
SOKETI_DEBUG=1
SOKETI_PORT=6002
SOKETI_APP_ID=some-id
SOKETI_APP_KEY=some-key
SOKETI_APP_SECRET=some-secret
SOKETI_WEBHOOK_URL=https://...
SOKETI_WEBHOOK_EVENT_TYPES=channel_occupied
```

Start Soketi with the .env file:

```bash
soketi start
```

### 2. Data Change Detection Mechanism

Implement a robust data change detection mechanism using PostgreSQL database triggers. PostgreSQL emits notifications when data changes occur, providing details about the modified records.

```sql
-- PostgreSQL Trigger Function
CREATE OR REPLACE FUNCTION notify_data_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract cache key from the modified record
  PERFORM pg_notify('data_change_notification', NEW.cache_key::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the target table
CREATE TRIGGER data_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_data
FOR EACH ROW
EXECUTE FUNCTION notify_data_change();
```

### 3. Cache Invalidation Notifications

Upon detecting data changes, generate cache invalidation notifications, including the unique identifier for each affected cache entry and the timestamp of the data change.

### 4. Send Notifications to Vercel

Utilize Soketi to dispatch cache invalidation notifications to your Vercel application.

### 5. Receive and Process Notifications in Vercel

In your Vercel application, implement a listener to receive cache invalidation notifications. Upon notification reception, identify the affected cache entries and invalidate them using Vercel's CDN API.

```typescript
import express from 'express';
import Soketi, { Socket } from 'soketi';
import pg from 'pg';

const app = express();
const server = app.listen(3000);
const soketiServer = new Soketi(server);

// Initialize PostgreSQL client
const pgClient = new pg.Client({
  connectionString: 'postgresql://user:password@localhost:5432/database',
});

// Connect to the PostgreSQL database
pgClient.connect();

// Set up a PostgreSQL notification listener for data changes
pgClient.on('notification', async (message) => {
  try {
    // Extract cache key from the notification payload
    const cacheKey = message.payload;
    console.log(`Data changed for cache key: ${cacheKey}`);

    // Generate cache invalidation notification using Soketi
    soketiServer.emit('cache-invalidate', { cacheKey });

    // Handle cache invalidation logic
    await handleCacheInvalidation(cacheKey);

    console.log(`Cache invalidated and updated for key: ${cacheKey}`);
  } catch (error) {
    console.error(`Error processing cache invalidation: ${error.message}`);
  }
});

// Handle Soketi connections
soketiServer.on('connection', (socket: Socket) => {
  // Listen for cache invalidation notifications from clients
  socket.on('cache-invalidate', async (data: { cacheKey: string }) => {
    try {
      const { cacheKey } = data;
      console.log(`Invalidating cache key: ${cacheKey}`);

      // Handle cache invalidation logic
      await handleCacheInvalidation(cacheKey);

      console.log(`Cache invalidated and updated for key: ${cacheKey}`);
    } catch (error) {
      console.error(`Error processing cache invalidation: ${error.message}`);
    }
  });
});

// Function to handle cache invalidation logic
const handleCacheInvalidation = async (cacheKey: string): Promise<void> => {
  // TODO: Implement cache invalidation logic here
  // For example, invalidate cache entry in Vercel's CDN, fetch updated data, and recache data
  // ...

  // Simulate asynchronous operations (replace with actual logic)
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// Example usage
// This example assumes cache invalidation notifications trigger automatically from PostgreSQL changes
// and the logic for handling invalidation is asynchronous.
```

### 6. Fetch Updated Data from PostgreSQL

For invalidated cache entries, fetch the latest data from the PostgreSQL database using specific SQL queries.

```sql
-- SQL Query to Fetch Updated Data
SELECT * FROM user_data WHERE cache_key = 'some_cache_key';
```

### 7. Recache Updated Data in Vercel

Recache the updated data in Vercel's CDN with appropriate cache headers, including the expiration time and cache invalidation identifier.

```typescript
// Import necessary libraries and modules
import { Cache } from 'your-cache-library'; // Import your cache library
import { VercelCDN } from 'your-vercel-cdn-library'; // Import your Vercel CDN library
import { PostgreSQLClient } from 'your-postgres-client-library'; // Import your PostgreSQL client library

// Define your cache expiration time (in seconds)
const cacheExpirationTime = 3600; // 1 hour

// Function to fetch updated data from PostgreSQL
const fetchDataFromPostgreSQL = async (cacheKey: string): Promise<any> => {
  try {
    // TODO: Implement logic to fetch data from PostgreSQL using specific SQL queries
    // Example: const result = await postgresClient.query(`SELECT * FROM your_table WHERE cache_key = $1`, [cacheKey]);
    // Return the fetched data
    return result.rows; // Modify as per the structure of your fetched data
  } catch (error) {
    throw new Error(`Error fetching data from PostgreSQL: ${error.message}`);
  }
};

// Recache Updated Data in Vercel's CDN (TypeScript)
const recacheUpdatedData = async (cacheKey: string) => {
  try {
    // Fetch updated data from your data source (e.g., PostgreSQL)
    const updatedData = await fetchDataFromPostgreSQL(cacheKey);

    // Initialize cache and Vercel CDN instances
    const cache = new Cache();
    const vercelCDN = new VercelCDN();

    // Set cache headers with expiration time and cache invalidation identifier
    const cacheHeaders = {
      'Cache-Control': `max-age=${cacheExpirationTime}, stale-while-revalidate`,
      'X-Cache-Invalidate-Identifier': cacheKey,
    };

    // Store updated data in the cache
    cache.set(cacheKey, updatedData, cacheExpirationTime);

    // Upload updated data to Vercel's CDN
    await vercelCDN.upload(cacheKey, updatedData, cacheHeaders);

    console.log(`Successfully recached data for cache key: ${cacheKey}`);
  } catch (error) {
    console.error(`Error recaching data for cache key ${cacheKey}: ${error.message}`);
  }
};

// Example usage
const cacheKey = 'some_cache_key';
recacheUpdatedData(cacheKey);
```

### 8. Timestamp-Based Cache Invalidation

Incorporate a more sophisticated timestamp-based cache invalidation strategy. This strategy prevents unnecessary updates within a short timeframe and refreshes cached data only after a specified time period.

```typescript
class TimestampCacheInvalidation {
  private lastUpdateTime: number = Date.now();
  private resetCounter: number = 0;
  private resetThreshold: number = 60 * 60 * 1000; // 60 minutes in milliseconds

  // Method to check if cache needs to be invalidated
  public shouldInvalidateCache(): boolean {
    const currentTime = Date.now();

    // Check if the reset threshold is reached
    if (currentTime - this.lastUpdateTime >= this.resetThreshold) {
      // Reset the counter and update the last update time
      this.resetCounter = 0;
      this.lastUpdateTime = currentTime;
      return false; // Cache does not need to be invalidated
    }

    // Increment the counter for each change
    this.resetCounter++;

    // Check if the counter reaches the threshold
    if (this.resetCounter >= 60) {
      // Reset the counter and update the last update time
      this.resetCounter = 0;
      this.lastUpdateTime = currentTime;
      return true; // Cache needs to be invalidated
    }

    return false; // Cache does not need to be invalidated
  }
}

// Example usage
const cacheInvalidation = new TimestampCacheInvalidation();

// Check if cache needs to be invalidated
if (cacheInvalidation.shouldInvalidateCache()) {
  // TODO: Implement cache invalidation logic here
  console.log("Cache should be invalidated. Implement cache invalidation logic here.");
} else {
  console.log("Cache does not need to be invalidated.");
}
```

## Example Implementation

```typescript
import express from 'express';
import Soketi, { Socket } from 'soketi';
import pg from 'pg';

const app = express();
const server = app.listen(3000);
const soketiServer = new Soketi(server);

// Initialize PostgreSQL client
const pgClient = new pg.Client({
  connectionString: 'postgresql://user:password@localhost:5432/database',
});

// Connect to the PostgreSQL database
pgClient.connect();

// Set up a PostgreSQL notification listener for data changes
pgClient.on('notification', (message) => {
  // Extract cache key from the notification payload
  const cacheKey = message.payload;
  console.log(`Data changed for cache key: ${cacheKey}`);

  // Generate cache invalidation notification using Soketi
  soketiServer.emit('cache-invalidate', { cacheKey });
});

// Handle Soketi connections
soketiServer.on('connection', (socket: Socket) => {
  // Listen for cache invalidation notifications from clients
  socket.on('cache-invalidate', (data: { cacheKey: string }) => {
    const { cacheKey } = data;
    console.log(`Invalidating cache key: ${cacheKey}`);

    // TODO: Invalidate cache entry in Vercel's CDN
    // ...

    // TODO: Fetch updated data from PostgreSQL database using specific SQL queries
    // ...

    // TODO: Recache updated data in Vercel's CDN
    // ...
  });
});
```

### Client-side (Vercel)

Here is the complete client-side implementation for Vercel:

```typescript
import Soketi from 'soketi';

// Create Soketi client instance and connect to the server
const soketiClient = new Soketi('ws://localhost:3000');

// Listen for cache invalidation notifications from the server
soketiClient.on('cache-invalidate', (data: { cacheKey: string }) => {
  const { cacheKey } = data;
  console.log(`Cache invalidated for key: ${cacheKey}`);

  // TODO: Invalidate cache entry in Vercel's CDN
  // ...
});
```

Refer to the [soketi web documentation](https://soketi.app/). You can also check the soketi project on [GitHub](https://github.com/soketi/soketi).

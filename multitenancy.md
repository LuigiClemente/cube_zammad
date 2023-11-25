### 1. Establishing Relationships:

In your PostgreSQL database, think of each user from Zammad like a hub. This hub connects to different tables named alimento, analise, refeicao, and usuario. Each user's hub, specifically in the usuario table, acts as a central point linking to specific records in these connected tables.

It's like having a main user ID that ties to different types of information about that user, such as food details (alimento), analyses (analise), meal information (refeicao), and general user data (usuario). This way, everything related to a user is neatly organized and connected through their unique hub in the usuario table.

```sql
-- For User table
ALTER TABLE usuario
ADD FOREIGN KEY (id_alimento) REFERENCES alimento(id),
ADD FOREIGN KEY (id_refeicao) REFERENCES refeicao(id);
```

This strongly says that each user in the usuario table is directly linked to specific information in the alimento and refeicao tables. It's like having a clear connection that ties a user to their related data in these other tables using foreign key relationships.


### 2. Data Security Measures:

Implementing robust security measures is imperative to ensure data integrity and confidentiality. Row-Level Security (RLS) plays a pivotal role, allowing access to specific rows based on predefined conditions. The following exemplifies a security policy specifically tailored for the `usuario` table:

```sql
CREATE POLICY usuario_policy
    ON usuario
    USING (id = current_user);
```

This irrefutably establishes that only the user whose `id` corresponds to the `current_user` is authorized to access their associated rows in the `usuario` table.

### 3. TypeScript Implementation:

In the TypeScript part, we're using a Node.js server with Express and the pg library. This helps connect your website's front end to the PostgreSQL database. The code snippet below shows how we've set up TypeScript in a confident way.

```typescript
import express, { Request, Response, NextFunction } from 'express';
import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Creating a PostgreSQL connection pool for handling database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware for Authentication and Authorization
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // Your Zammad authentication logic here
  // Your Zammad valid authentication token / session
  // If not, return a 401 Unauthorized response
  // Otherwise, set req.user with the authenticated user details
  next();
};

// Middleware for Error Handling
const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  // Return a more specific error message based on the type of error
  res.status(500).json({ error: 'Internal Server Error' });
};

// API endpoint to get user-specific data
app.get('/api/v1/user-data', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Check if the user is authenticated
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Querying the database to fetch user data based on the user ID
    const userData: QueryResult = await pool.query('SELECT * FROM usuario WHERE id = $1', [userId]);

    // Check if the user exists
    if (userData.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user data as a JSON response
    res.json(userData.rows[0]);
  } catch (error) {
    // Log and handle more specific errors
    next(error);
  }
});

// Apply error handling middleware
app.use(handleErrors);

// Start the Express server on the specified port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

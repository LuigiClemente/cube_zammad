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

In the TypeScript implementation, a Node.js server, driven by Express and the `pg` library, solidifies the integration between your frontend and the PostgreSQL database. The code snippet below exemplifies the assertive TypeScript implementation:

```typescript
import express from 'express';
import { Pool } from 'pg';

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'your_user',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

app.use(express.json());

app.get('/api/user-data', async (req, res) => {
  const userId = req.user.id; // User information is included in the request

  try {
    // Fetch user-specific data
    const userData = await pool.query('SELECT * FROM usuario WHERE id = $1', [userId]);

    res.json(userData.rows);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

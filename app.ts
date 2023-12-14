import express, { Request, Response, NextFunction } from "express";
import { Pool, Client } from "pg";
import dotenv from "dotenv";
import ZammadApi from "./users";

dotenv.config();

interface UserRequset extends Request {
  user?: any;
}
// Creating a PostgreSQL connection pool for handling database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const NEXT_URL = "https://client-vercel-b21quocbao.vercel.app";

// Initialize PostgreSQL client
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to the PostgreSQL database
pgClient.connect();

pgClient.query("LISTEN data_change_notification");

pgClient.on("notification", async (message) => {
  console.log(message);
  try {
    // Extract cache key from the notification payload
    const cacheKey = message.payload;
    console.log(`Data changed for cache key: ${cacheKey}`);

    // Call NextJs API to generate cache invalidation notification
    var requestOptions = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        tag: "user-data",
      }),
    };

    await fetch(`${NEXT_URL}/api/invalidate`, requestOptions);

    console.log(`Cache invalidated and updated for key: ${cacheKey}`);
  } catch (error) {
    console.error(`Error processing cache invalidation: ${error}`);
  }
});

const app = express();
const port = process.env.PORT || 3000;
const cubeContext = {
  securityContext: {
    // TODO: Change tenant_id
    tenant_id: "undefined",
  },
  contextToAppId: ({ securityContext }: any) => {
    return `CUBE_APP_${securityContext.tenant_id}`;
  },

  contextToOrchestratorId: ({ securityContext }: any) => {
    return `CUBE_APP_${securityContext.tenant_id}`;
  },
};
const zammadApi = new ZammadApi(process.env.ZAMMAD_HOST as string, cubeContext);

app.use(
  express.json({
    verify: zammadApi.verifyRequest,
  })
);

// Middleware for Authentication and Authorization
const authenticateUser = async (
  req: UserRequset,
  res: Response,
  next: NextFunction
) => {
  // Your Zammad authentication logic here
  // Your Zammad valid authentication token / session
  // If not, return a 401 Unauthorized response
  // Otherwise, set req.user with the authenticated user details
  const user = await zammadApi.getMyInformation();
  if (user) {
    req.user = user;
    next();
  }
};

// Middleware for Error Handling
const handleErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  // Return a more specific error message based on the type of error
  res.status(500).json({ error: "Internal Server Error" });
};

// API endpoint for zammad webhook
app.post(
  "/api/v1/webhook",
  async (req: UserRequset, res: Response, next: NextFunction) => {
    try {
      const headers = req.headers;
      const payload = req.body;

      // Check webhook payload validation
      const isValidated = zammadApi.validateWebhookPayload(payload);

      // Import user ID from the validated webhook
      const userId = payload.ticket.customer_id;

      // To debug
      const sqlQuery = `
      CREATE POLICY usuario_policy_${userId}
      ON usuario
      USING (database_name = current_user AND zammad_user_id = $1);
    `;

      // Create policy on database
      await pool.query(sqlQuery, [userId]);

      if (isValidated) {
        res.status(200);
      } else {
        res.status(400);
      }
    } catch (error) {
      // Log and handle more specific errors
      next(error);
    }
  }
);

// API endpoint to get user-specific data with pagination and sorting
app.get(
  "/api/v1/user-data",
  authenticateUser,
  async (req: UserRequset, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      // Check if the user is authenticated
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Query parameters for pagination and sorting
      const { page = 1, per_page = 5 } = req.query;

      // Construct the SQL query with pagination and sorting
      const sqlQuery = `
      SELECT *
      FROM usuario
      WHERE id = $1
      LIMIT ${per_page}
      OFFSET ${(Number(page) - 1) * Number(per_page)};
    `;

      // Querying the database to fetch user data based on the user ID with pagination and sorting
      const userData = await pool.query(sqlQuery, [userId]);

      // Check if the user exists
      if (userData.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return the user data as a JSON response
      res.json(userData.rows);
    } catch (error) {
      // Log and handle more specific errors
      next(error);
    }
  }
);

// Apply error handling middleware
app.use(handleErrors);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

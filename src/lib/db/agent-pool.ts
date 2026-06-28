import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const host = process.env.OPS_DB_HOST;
const port = Number(process.env.OPS_DB_PORT) || 3306;
const user = process.env.OPS_DB_USER;
const password = process.env.OPS_DB_PASSWORD;
const database = process.env.OPS_DB_NAME;

// Create the mysql2 connection pool for Operational DB
const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const agentPool = pool;
export const agentDb = drizzle(pool);

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const host = process.env.APP_DB_HOST;
const port = Number(process.env.APP_DB_PORT) || 3306;
const user = process.env.APP_DB_USER;
const password = process.env.APP_DB_PASSWORD;
const database = process.env.APP_DB_NAME;

// Create the mysql2 connection pool for App DB
const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const appPool = pool;
export const db = drizzle(pool);

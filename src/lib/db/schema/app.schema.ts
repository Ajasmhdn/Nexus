import { mysqlTable, varchar, mysqlEnum, boolean, datetime, int, json, text, timestamp, AnyMySqlColumn } from "drizzle-orm/mysql-core";

/**
 * Table: users
 * Stores application users, their roles, and credentials.
 */
export const users = mysqlTable("users", {
  userId: varchar("user_id", { length: 20 }).primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  forcePasswordReset: boolean("force_password_reset").notNull().default(true),
  passwordChangedAt: datetime("password_changed_at"),
  lastLoginAt: datetime("last_login_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 20 })
    .references((): AnyMySqlColumn => users.userId, { onDelete: "set null", onUpdate: "cascade" }), // self-referencing FK
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: password_reset_tokens
 * Holds time-limited reset hashes sent via email for password changes.
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  tokenId: int("token_id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 20 })
    .notNull()
    .references(() => users.userId, { onDelete: "cascade", onUpdate: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: datetime("expires_at").notNull(),
  usedAt: datetime("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Table: chat_sessions
 * Holds conversational threads per user. Supports soft deletion.
 */
export const chatSessions = mysqlTable("chat_sessions", {
  sessionId: varchar("session_id", { length: 36 }).primaryKey(), // UUID v4
  userId: varchar("user_id", { length: 20 })
    .notNull()
    .references(() => users.userId, { onDelete: "restrict", onUpdate: "cascade" }),
  title: varchar("title", { length: 60 }).notNull(),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: messages
 * Stores dialogue messages associated with chat sessions.
 * assistant role captures full ContentBlock[] payload, SQL queries and details.
 */
export const messages = mysqlTable("messages", {
  messageId: varchar("message_id", { length: 36 }).primaryKey(), // UUID v4
  sessionId: varchar("session_id", { length: 36 })
    .notNull()
    .references(() => chatSessions.sessionId, { onDelete: "restrict", onUpdate: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  blocks: json("blocks"), // Full ContentBlock[] structured response
  generatedSql: text("generated_sql"),
  sqlExecuted: text("sql_executed"),
  sqlValidationStatus: mysqlEnum("sql_validation_status", ["approved", "optimized", "rejected"]),
  resultValidationStatus: mysqlEnum("result_validation_status", ["validated", "warning", "failed"]),
  optimizationNotes: text("optimization_notes"),
  tablesAccessed: json("tables_accessed"), // string[] array of tables involved
  executionTimeMs: int("execution_time_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Table: audit_logs
 * Track core administrative changes for analytics and accountability.
 */
export const auditLogs = mysqlTable("audit_logs", {
  auditId: int("audit_id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 20 })
    .notNull()
    .references(() => users.userId, { onDelete: "restrict", onUpdate: "cascade" }),
  action: varchar("action", { length: 40 }).notNull(),
  entityType: varchar("entity_type", { length: 20 }),
  entityId: varchar("entity_id", { length: 36 }),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

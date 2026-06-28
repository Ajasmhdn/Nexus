// src/lib/constants.ts

export const ALLOWED_TABLES = [
  'machines', 'employees', 'inventory', 'suppliers',
  'work_orders', 'maintenance_logs', 'downtime_events',
  'purchase_orders', 'shift_logs', 'quality_checks'
] as const;

export const MAX_QUERY_ROWS = 500;
export const SESSION_MEMORY_PAIRS = 6;        // last N user+assistant pairs
export const MAX_SCHEMA_TABLES = 3;           // max tables injected per query
export const JWT_EXPIRY = '8h';
export const RESET_TOKEN_EXPIRY_MINUTES = 15;
export const SESSION_TITLE_MAX_CHARS = 60;
export const DDL_TOKEN_BUDGET_PER_TABLE = 300;
export const SQL_EXECUTION_TIMEOUT_MS = 30000;
export const NULL_DENSITY_WARN_THRESHOLD = 0.4; // 40%

export const CHART_RULES = {
  NO_CHART_ROWS: 0,
  METRICS_ONLY_ROWS: 1,
  PIE_MAX_ROWS: 4,
  CHART_MAX_ROWS: 20,
} as const;

export const BLOCKED_SQL_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
  'TRUNCATE', 'EXEC', 'EXECUTE', 'CREATE', 'GRANT',
  'REVOKE', 'MERGE', 'CALL', 'LOAD', 'REPLACE'
] as const;

export const JOB_TITLES = [
  'Administrator',
  'System Administrator',
  'Manager',
  'Operations Engineer',
  'Production Head',
  'Maintenance Engineer',
  'Quality Engineer',
  'Technical Lead',
  'Data Engineer',
  'AI Engineer',
  'Analyst',
  'User'
] as const;

export type JobTitle = typeof JOB_TITLES[number];

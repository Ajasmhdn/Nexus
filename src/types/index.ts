// ─── Conversation Types ───────────────────────────────────────────

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string; // ISO 8601 — display via formatRelativeTime()
  isActive: boolean;
  messageCount: number;
}

export interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

// ─── Message Types ────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO 8601 — display via formatTime()
  blocks?: ContentBlock[];
}

// ─── Rich Content Blocks ──────────────────────────────────────────
// Each block carries a stable `id` for React reconciliation.

export type ContentBlock =
  | TextBlock
  | InsightBlock
  | SqlBlock
  | MetricBlock
  | TableBlock
  | ChartBlock
  | SummaryBlock;

export interface TextBlock {
  id: string;
  type: "text";
  content: string;
}

export interface InsightBlock {
  id: string;
  type: "insight";
  variant: "warning" | "success" | "info" | "error";
  content: string;
}

export interface SqlBlock {
  id: string;
  type: "sql";
  query: string;
  explanation?: string;
}

export interface MetricBlock {
  id: string;
  type: "metrics";
  items: MetricItem[];
}

export interface MetricItem {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface TableBlock {
  id: string;
  type: "table";
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ChartBlock {
  id: string;
  type: "chart";
  chartType: "bar" | "line" | "pie";
  title: string;
  xAxisKey: string;
  yAxisKey: string;
  data: Record<string, unknown>[];
}

export interface SummaryBlock {
  id: string;
  type: "summary";
  title: string;
  content: string;
}

// ─── Agent Response Contract ──────────────────────────────────────
// Deterministic schema returned by the LangChain / Gemini agent.

export interface ChartConfig {
  renderChart: boolean;
  chartType: "bar" | "line" | "pie";
  xAxisKey: string;
  yAxisKey: string;
  data: Record<string, unknown>[];
}

export interface AgentResponse {
  text: string;
  sql?: string;
  chartConfig?: ChartConfig;
  tableData?: TableBlock;
  metrics?: MetricBlock;
  executionTimeMs?: number;
  tablesAccessed?: string[];
}

// ─── Session & Auth Types ─────────────────────────────────────────

export interface AppUser {
  userId: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Schema Types ─────────────────────────────────────────────────

export interface DatabaseSchema {
  tables: SchemaTable[];
}

export interface SchemaTable {
  name: string;
  rowCount: number;
  columns: SchemaColumn[];
}

export interface SchemaColumn {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
  nullable?: boolean;
}

// ─── Query History Types ──────────────────────────────────────────

export interface QueryExecution {
  id: string;
  query: string;
  status: "success" | "error" | "running";
  executionTime: string;
  rowCount: number;
  timestamp: string; // ISO 8601
  table?: string;
}

// ─── User Types ───────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

// ─── Feature Types (Landing Page) ─────────────────────────────────

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

import {
  ConversationGroup,
  Message,
  DatabaseSchema,
  QueryExecution,
  UserProfile,
  Feature,
  StatItem,
} from "@/types";

// ─── User Profile ─────────────────────────────────────────────────

export const currentUser: UserProfile = {
  name: "Sarah Chen",
  email: "s.chen@meridian-mfg.com",
  role: "Operations Analyst",
};

// ─── Conversation History (CLEARED FOR DB PERSISTENCE) ─────────────────────────────

export const conversationGroups: ConversationGroup[] = [];

export const activeMessages: Message[] = [];

export const analysisTableData = {
  headers: [] as string[],
  rows: [] as string[][],
  metadata: {
    rowCount: 0,
    executionTime: "0ms",
    table: "",
  }
};

export const currentSql = "";

export const databaseSchema: DatabaseSchema = {
  tables: []
};

export const queryHistory: QueryExecution[] = [];

// ─── Landing Page Data ────────────────────────────────────────────

export const features: Feature[] = [
  {
    icon: "message-square-text",
    title: "Natural Language Analytics",
    description:
      "Query operational databases using plain English. No SQL knowledge required for your team to get answers.",
  },
  {
    icon: "code",
    title: "SQL Generation & Execution",
    description:
      "AI generates optimized SQL from your questions, with full transparency into every query before execution.",
  },
  {
    icon: "bar-chart-3",
    title: "Operational Intelligence",
    description:
      "Surface insights from equipment downtime, production metrics, maintenance logs, and inventory data.",
  },
  {
    icon: "database",
    title: "Schema Awareness",
    description:
      "The AI understands your database structure, relationships, and business context for accurate query generation.",
  },
  {
    icon: "history",
    title: "Query History & Audit",
    description:
      "Full audit trail of every query. Review execution times, results, and share analyses across your team.",
  },
  {
    icon: "users",
    title: "Team Collaboration",
    description:
      "Share conversation threads, pin important analyses, and build a shared knowledge base for your operations.",
  },
];

export const stats: StatItem[] = [
  { value: "10M+", label: "Queries Processed" },
  { value: "500+", label: "Organizations" },
  { value: "99.9%", label: "Reliability" },
];

// ─── Suggested Prompts ────────────────────────────────────────────

export const suggestedPrompts = [
  "Show equipment downtime",
  "Maintenance summary",
  "Production metrics",
  "Technician response times",
];

import {
  ConversationGroup,
  Message,
  ContentBlock,
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

// ─── Conversation History ─────────────────────────────────────────

export const conversationGroups: ConversationGroup[] = [
  {
    label: "Today",
    conversations: [
      {
        id: "conv-1",
        title: "Equipment Downtime Analysis",
        preview: "Show me all equipment downtime events for Plant A…",
        timestamp: "2026-06-28T06:22:00Z",
        isActive: true,
        messageCount: 4,
      },
      {
        id: "conv-2",
        title: "Maintenance Summary Q2",
        preview: "Summarize maintenance activities for Q2 2025",
        timestamp: "2026-06-28T05:24:00Z",
        isActive: false,
        messageCount: 6,
      },
    ],
  },
  {
    label: "Yesterday",
    conversations: [
      {
        id: "conv-3",
        title: "Production Throughput Review",
        preview: "Compare Line 4 throughput vs target for June",
        timestamp: "2026-06-27T14:10:00Z",
        isActive: false,
        messageCount: 8,
      },
      {
        id: "conv-4",
        title: "Inventory Reorder Alerts",
        preview: "Which parts are below minimum stock levels?",
        timestamp: "2026-06-27T09:35:00Z",
        isActive: false,
        messageCount: 3,
      },
    ],
  },
  {
    label: "Previous 7 Days",
    conversations: [
      {
        id: "conv-5",
        title: "Technician Performance Report",
        preview: "Rank technicians by average response time",
        timestamp: "2026-06-25T11:00:00Z",
        isActive: false,
        messageCount: 5,
      },
      {
        id: "conv-6",
        title: "Quality Control Batch #4829",
        preview: "Show rejection rates for batch 4829",
        timestamp: "2026-06-23T16:45:00Z",
        isActive: false,
        messageCount: 7,
      },
    ],
  },
];

// ─── Active Conversation Messages ─────────────────────────────────

const downtimeBlocks: ContentBlock[] = [
  {
    id: "blk-dt-summary",
    type: "summary",
    title: "Query Results",
    content:
      "Found **47 downtime events** across **12 machines** in Plant A over the last 30 days. Total accumulated downtime is **374.2 hours**, with an average event duration of **7.96 hours**.",
  },
  {
    id: "blk-dt-sql",
    type: "sql",
    query: `SELECT
  e.equipment_id,
  e.machine_name,
  d.start_time,
  d.end_time,
  ROUND(TIMESTAMPDIFF(SECOND, d.start_time, d.end_time) / 3600, 2) AS duration_hrs,
  d.reason,
  t.technician_name
FROM equipment_downtime d
JOIN equipment e ON e.equipment_id = d.equipment_id
JOIN technicians t ON t.technician_id = d.assigned_technician
WHERE e.plant = 'Plant A'
  AND d.start_time >= NOW() - INTERVAL 30 DAY
ORDER BY duration_hrs DESC;`,
    explanation:
      "Joins the downtime events with equipment metadata and technician assignments, filtering for Plant A within the last 30 days, ordered by longest duration first.",
  },
  {
    id: "blk-dt-insight",
    type: "insight",
    variant: "warning",
    content:
      "CNC Mill #3 accounts for 34% of total downtime (127.5 hours). Bearing failure is the recurring root cause — consider scheduling preventive maintenance.",
  },
  {
    id: "blk-dt-metrics",
    type: "metrics",
    items: [
      {
        label: "Total Downtime",
        value: "374.2 hrs",
        trend: "up",
        trendValue: "+12.3%",
      },
      {
        label: "Avg Duration",
        value: "7.96 hrs",
        trend: "down",
        trendValue: "-0.4 hrs",
      },
      {
        label: "Most Affected",
        value: "CNC Mill #3",
        trend: "up",
        trendValue: "34% share",
      },
      {
        label: "Top Cause",
        value: "Bearing Failure",
        trend: "neutral",
        trendValue: "18 events",
      },
    ],
  },
  {
    id: "blk-dt-table",
    type: "table",
    headers: [
      "Equipment",
      "Machine",
      "Start",
      "End",
      "Duration",
      "Reason",
      "Technician",
    ],
    rows: [
      [
        "EQ-1042",
        "CNC Mill #3",
        "Jun 18, 08:14",
        "Jun 19, 21:42",
        "37.47 hrs",
        "Bearing Failure",
        "Rodriguez",
      ],
      [
        "EQ-1042",
        "CNC Mill #3",
        "Jun 12, 03:20",
        "Jun 13, 11:55",
        "32.58 hrs",
        "Bearing Failure",
        "Nakamura",
      ],
      [
        "EQ-1015",
        "Hydraulic Press #1",
        "Jun 20, 14:30",
        "Jun 21, 18:15",
        "27.75 hrs",
        "Hydraulic Leak",
        "Thompson",
      ],
      [
        "EQ-1028",
        "Conveyor Belt #7",
        "Jun 15, 22:00",
        "Jun 17, 00:30",
        "26.50 hrs",
        "Motor Burnout",
        "Rodriguez",
      ],
      [
        "EQ-1042",
        "CNC Mill #3",
        "Jun 05, 16:45",
        "Jun 06, 17:10",
        "24.42 hrs",
        "Spindle Alignment",
        "Kim",
      ],
      [
        "EQ-1033",
        "Welding Robot #2",
        "Jun 22, 09:00",
        "Jun 23, 06:15",
        "21.25 hrs",
        "Sensor Calibration",
        "Patel",
      ],
      [
        "EQ-1008",
        "Lathe #5",
        "Jun 08, 11:30",
        "Jun 09, 04:00",
        "16.50 hrs",
        "Tool Wear",
        "Thompson",
      ],
      [
        "EQ-1051",
        "Packaging Line #3",
        "Jun 17, 07:00",
        "Jun 17, 19:45",
        "12.75 hrs",
        "Jam Sensor",
        "Kim",
      ],
    ],
    caption: "Top 8 downtime events by duration — Plant A, last 30 days",
  },
  {
    id: "blk-dt-chart",
    type: "chart",
    chartType: "bar",
    title: "Downtime by Machine (Hours)",
    xAxisKey: "machine",
    yAxisKey: "hours",
    data: [
      { machine: "CNC Mill #3", hours: 127.5 },
      { machine: "Hyd. Press #1", hours: 52.3 },
      { machine: "Conv. Belt #7", hours: 44.8 },
      { machine: "Welding Robot #2", hours: 38.6 },
      { machine: "Lathe #5", hours: 31.2 },
      { machine: "Pkg Line #3", hours: 28.4 },
    ],
  },
];

const technicianBlocks: ContentBlock[] = [
  {
    id: "blk-tc-summary",
    type: "summary",
    title: "Technician Response Analysis",
    content:
      "Analyzed response times for **6 active technicians** across **47 downtime events** in Plant A. Response times range from **12 to 38 minutes**, with significant variance in completion rates for complex repairs.",
  },
  {
    id: "blk-tc-sql",
    type: "sql",
    query: `SELECT
  t.technician_name,
  COUNT(d.id) AS total_jobs,
  ROUND(AVG(TIMESTAMPDIFF(SECOND, d.start_time, d.response_time) / 60), 0) AS avg_response_min,
  ROUND(AVG(TIMESTAMPDIFF(SECOND, d.start_time, d.end_time) / 3600), 1) AS avg_resolution_hrs,
  ROUND(100.0 * SUM(CASE WHEN d.status = 'resolved' THEN 1 ELSE 0 END) / COUNT(*), 1) AS completion_rate
FROM equipment_downtime d
JOIN technicians t ON t.technician_id = d.assigned_technician
WHERE d.start_time >= NOW() - INTERVAL 30 DAY
GROUP BY t.technician_name
ORDER BY avg_response_min ASC;`,
  },
  {
    id: "blk-tc-table",
    type: "table",
    headers: [
      "Technician",
      "Total Jobs",
      "Avg Response",
      "Avg Resolution",
      "Completion Rate",
    ],
    rows: [
      ["Rodriguez", "14", "12 min", "6.2 hrs", "96.4%"],
      ["Nakamura", "9", "15 min", "8.1 hrs", "100%"],
      ["Thompson", "11", "18 min", "5.8 hrs", "90.9%"],
      ["Kim", "6", "22 min", "9.4 hrs", "100%"],
      ["Patel", "5", "28 min", "7.3 hrs", "80.0%"],
      ["Garcia", "2", "38 min", "11.2 hrs", "50.0%"],
    ],
    caption: "Technician performance — last 30 days",
  },
  {
    id: "blk-tc-insight",
    type: "insight",
    variant: "info",
    content:
      "Rodriguez has the fastest average response time at 12 minutes and handles the most jobs (14), but note that Nakamura and Kim maintain 100% completion rates despite longer response times — they tend to handle more complex repairs.",
  },
  {
    id: "blk-tc-chart",
    type: "chart",
    chartType: "bar",
    title: "Avg Response Time by Technician (Minutes)",
    xAxisKey: "technician",
    yAxisKey: "minutes",
    data: [
      { technician: "Rodriguez", minutes: 12 },
      { technician: "Nakamura", minutes: 15 },
      { technician: "Thompson", minutes: 18 },
      { technician: "Kim", minutes: 22 },
      { technician: "Patel", minutes: 28 },
      { technician: "Garcia", minutes: 38 },
    ],
  },
];

export const activeMessages: Message[] = [
  {
    id: "msg-1",
    role: "user",
    content:
      "Show me all equipment downtime events for Plant A in the last 30 days, sorted by duration",
    timestamp: "2026-06-28T04:54:00Z",
  },
  {
    id: "msg-2",
    role: "assistant",
    content: "",
    timestamp: "2026-06-28T04:54:12Z",
    blocks: downtimeBlocks,
  },
  {
    id: "msg-3",
    role: "user",
    content: "Which maintenance technicians responded fastest on average?",
    timestamp: "2026-06-28T05:01:00Z",
  },
  {
    id: "msg-4",
    role: "assistant",
    content: "",
    timestamp: "2026-06-28T05:01:08Z",
    blocks: technicianBlocks,
  },
];

// ─── Analysis Panel Data ──────────────────────────────────────────

export const analysisTableData = {
  headers: [
    "Equipment",
    "Machine",
    "Start",
    "End",
    "Duration",
    "Reason",
    "Technician",
  ],
  rows: [
    [
      "EQ-1042",
      "CNC Mill #3",
      "Jun 18, 08:14",
      "Jun 19, 21:42",
      "37.47 hrs",
      "Bearing Failure",
      "Rodriguez",
    ],
    [
      "EQ-1042",
      "CNC Mill #3",
      "Jun 12, 03:20",
      "Jun 13, 11:55",
      "32.58 hrs",
      "Bearing Failure",
      "Nakamura",
    ],
    [
      "EQ-1015",
      "Hyd. Press #1",
      "Jun 20, 14:30",
      "Jun 21, 18:15",
      "27.75 hrs",
      "Hydraulic Leak",
      "Thompson",
    ],
    [
      "EQ-1028",
      "Conv. Belt #7",
      "Jun 15, 22:00",
      "Jun 17, 00:30",
      "26.50 hrs",
      "Motor Burnout",
      "Rodriguez",
    ],
    [
      "EQ-1042",
      "CNC Mill #3",
      "Jun 05, 16:45",
      "Jun 06, 17:10",
      "24.42 hrs",
      "Spindle Alignment",
      "Kim",
    ],
    [
      "EQ-1033",
      "Weld Robot #2",
      "Jun 22, 09:00",
      "Jun 23, 06:15",
      "21.25 hrs",
      "Sensor Cal.",
      "Patel",
    ],
    [
      "EQ-1008",
      "Lathe #5",
      "Jun 08, 11:30",
      "Jun 09, 04:00",
      "16.50 hrs",
      "Tool Wear",
      "Thompson",
    ],
    [
      "EQ-1051",
      "Pkg Line #3",
      "Jun 17, 07:00",
      "Jun 17, 19:45",
      "12.75 hrs",
      "Jam Sensor",
      "Kim",
    ],
  ],
  metadata: {
    rowCount: 47,
    executionTime: "0.23s",
    table: "equipment_downtime",
  },
};

export const currentSql = `SELECT
  e.equipment_id,
  e.machine_name,
  d.start_time,
  d.end_time,
  ROUND(TIMESTAMPDIFF(SECOND, d.start_time, d.end_time) / 3600, 2) AS duration_hrs,
  d.reason,
  t.technician_name
FROM equipment_downtime d
JOIN equipment e ON e.equipment_id = d.equipment_id
JOIN technicians t ON t.technician_id = d.assigned_technician
WHERE e.plant = 'Plant A'
  AND d.start_time >= NOW() - INTERVAL 30 DAY
ORDER BY duration_hrs DESC;`;

// ─── Database Schema ──────────────────────────────────────────────

export const databaseSchema: DatabaseSchema = {
  tables: [
    {
      name: "machines",
      rowCount: 25,
      columns: [
        { name: "machine_id", type: "INT", isPrimaryKey: true },
        { name: "machine_code", type: "VARCHAR(20)" },
        { name: "machine_name", type: "VARCHAR(100)" },
        { name: "machine_type", type: "VARCHAR(50)" },
        { name: "production_line", type: "VARCHAR(50)" },
        { name: "location", type: "VARCHAR(100)" },
        { name: "installation_date", type: "DATE" },
        { name: "status", type: "VARCHAR(20)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "downtime_events",
      rowCount: 1482,
      columns: [
        { name: "event_id", type: "INT", isPrimaryKey: true },
        { name: "event_code", type: "VARCHAR(20)" },
        { name: "machine_id", type: "INT", isForeignKey: true, references: "machines.machine_id" },
        { name: "start_time", type: "DATETIME" },
        { name: "end_time", type: "DATETIME", nullable: true },
        { name: "duration_minutes", type: "INT", nullable: true },
        { name: "reason", type: "VARCHAR(100)" },
        { name: "severity", type: "VARCHAR(10)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "employees",
      rowCount: 74,
      columns: [
        { name: "employee_id", type: "INT", isPrimaryKey: true },
        { name: "employee_code", type: "VARCHAR(20)" },
        { name: "employee_name", type: "VARCHAR(100)" },
        { name: "role", type: "VARCHAR(20)" },
        { name: "department", type: "VARCHAR(50)" },
        { name: "hire_date", type: "DATE" },
        { name: "status", type: "VARCHAR(20)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "shift_logs",
      rowCount: 3209,
      columns: [
        { name: "shift_log_id", type: "INT", isPrimaryKey: true },
        { name: "shift_code", type: "VARCHAR(20)" },
        { name: "employee_id", type: "INT", isForeignKey: true, references: "employees.employee_id" },
        { name: "shift_date", type: "DATE" },
        { name: "shift_type", type: "VARCHAR(10)" },
        { name: "start_time", type: "DATETIME" },
        { name: "end_time", type: "DATETIME", nullable: true },
        { name: "notes", type: "TEXT", nullable: true },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "suppliers",
      rowCount: 18,
      columns: [
        { name: "supplier_id", type: "INT", isPrimaryKey: true },
        { name: "supplier_code", type: "VARCHAR(20)" },
        { name: "supplier_name", type: "VARCHAR(100)" },
        { name: "contact_phone", type: "VARCHAR(20)", nullable: true },
        { name: "contact_email", type: "VARCHAR(100)", nullable: true },
        { name: "lead_time_days", type: "INT" },
        { name: "reliability_score", type: "DECIMAL(5,2)" },
        { name: "country", type: "VARCHAR(50)" },
        { name: "status", type: "VARCHAR(10)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "inventory",
      rowCount: 642,
      columns: [
        { name: "item_id", type: "INT", isPrimaryKey: true },
        { name: "item_code", type: "VARCHAR(20)" },
        { name: "item_name", type: "VARCHAR(100)" },
        { name: "category", type: "VARCHAR(50)" },
        { name: "quantity_in_stock", type: "INT" },
        { name: "warehouse_location", type: "VARCHAR(20)" },
        { name: "reorder_level", type: "INT" },
        { name: "unit_of_measure", type: "VARCHAR(20)" },
        { name: "status", type: "VARCHAR(15)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "maintenance_logs",
      rowCount: 852,
      columns: [
        { name: "log_id", type: "INT", isPrimaryKey: true },
        { name: "log_code", type: "VARCHAR(20)" },
        { name: "machine_id", type: "INT", isForeignKey: true, references: "machines.machine_id" },
        { name: "employee_id", type: "INT", isForeignKey: true, references: "employees.employee_id" },
        { name: "issue_type", type: "VARCHAR(50)" },
        { name: "issue_description", type: "TEXT" },
        { name: "reported_time", type: "DATETIME" },
        { name: "resolved_time", type: "DATETIME", nullable: true },
        { name: "resolution_notes", type: "TEXT", nullable: true },
        { name: "status", type: "VARCHAR(15)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "work_orders",
      rowCount: 512,
      columns: [
        { name: "order_id", type: "INT", isPrimaryKey: true },
        { name: "work_order_number", type: "VARCHAR(20)" },
        { name: "machine_id", type: "INT", isForeignKey: true, references: "machines.machine_id" },
        { name: "item_id", type: "INT", isForeignKey: true, references: "inventory.item_id", nullable: true },
        { name: "product_name", type: "VARCHAR(100)" },
        { name: "quantity_planned", type: "INT" },
        { name: "quantity_completed", type: "INT" },
        { name: "priority", type: "VARCHAR(10)" },
        { name: "start_time", type: "DATETIME" },
        { name: "end_time", type: "DATETIME", nullable: true },
        { name: "status", type: "VARCHAR(10)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "purchase_orders",
      rowCount: 279,
      columns: [
        { name: "po_id", type: "INT", isPrimaryKey: true },
        { name: "po_number", type: "VARCHAR(20)" },
        { name: "supplier_id", type: "INT", isForeignKey: true, references: "suppliers.supplier_id" },
        { name: "item_id", type: "INT", isForeignKey: true, references: "inventory.item_id" },
        { name: "quantity", type: "INT" },
        { name: "order_date", type: "DATE" },
        { name: "expected_delivery_date", type: "DATE" },
        { name: "actual_delivery_date", type: "DATE", nullable: true },
        { name: "status", type: "VARCHAR(10)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
    {
      name: "quality_checks",
      rowCount: 1253,
      columns: [
        { name: "check_id", type: "INT", isPrimaryKey: true },
        { name: "qc_code", type: "VARCHAR(20)" },
        { name: "machine_id", type: "INT", isForeignKey: true, references: "machines.machine_id" },
        { name: "work_order_id", type: "INT", isForeignKey: true, references: "work_orders.order_id" },
        { name: "product_name", type: "VARCHAR(100)" },
        { name: "result", type: "VARCHAR(5)" },
        { name: "defect_type", type: "VARCHAR(50)", nullable: true },
        { name: "inspection_date", type: "DATETIME" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" },
      ],
    },
  ],
};

// ─── Query History ────────────────────────────────────────────────

export const queryHistory: QueryExecution[] = [
  {
    id: "qe-1",
    query: "SELECT ... FROM equipment_downtime ... ORDER BY duration_hrs DESC",
    status: "success",
    executionTime: "0.23s",
    rowCount: 47,
    timestamp: "2026-06-28T04:54:12Z",
    table: "equipment_downtime",
  },
  {
    id: "qe-2",
    query: "SELECT ... FROM equipment_downtime d JOIN technicians t ...",
    status: "success",
    executionTime: "0.18s",
    rowCount: 6,
    timestamp: "2026-06-28T05:01:08Z",
    table: "equipment_downtime",
  },
  {
    id: "qe-3",
    query: "SELECT COUNT(*) FROM maintenance_logs WHERE status = 'overdue'",
    status: "success",
    executionTime: "0.04s",
    rowCount: 1,
    timestamp: "2026-06-28T04:25:00Z",
    table: "maintenance_logs",
  },
  {
    id: "qe-4",
    query: "SELECT * FROM inventory WHERE quantity_in_stock < reorder_level",
    status: "success",
    executionTime: "0.11s",
    rowCount: 23,
    timestamp: "2026-06-28T04:12:00Z",
    table: "inventory",
  },
  {
    id: "qe-5",
    query: "SELECT * FROM production_metrics WHERE line_id = 'L-999'",
    status: "error",
    executionTime: "0.02s",
    rowCount: 0,
    timestamp: "2026-06-28T03:45:00Z",
    table: "production_metrics",
  },
];

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

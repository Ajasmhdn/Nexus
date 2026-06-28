import { mysqlTable, int, varchar, date, datetime, timestamp, decimal, text } from "drizzle-orm/mysql-core";

/**
 * Table: machines
 * Tracks manufacturing machinery configurations and statuses.
 */
export const machines = mysqlTable("machines", {
  machineId: int("machine_id").primaryKey(),
  machineCode: varchar("machine_code", { length: 20 }).notNull().unique(),
  machineName: varchar("machine_name", { length: 100 }).notNull(),
  machineType: varchar("machine_type", { length: 50 }).notNull(),
  productionLine: varchar("production_line", { length: 50 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  installationDate: date("installation_date").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: employees
 * Tracks shifts, roles, and profiles of operators and technicians.
 */
export const employees = mysqlTable("employees", {
  employeeId: int("employee_id").primaryKey(),
  employeeCode: varchar("employee_code", { length: 20 }).notNull().unique(),
  employeeName: varchar("employee_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  department: varchar("department", { length: 50 }).notNull(),
  hireDate: date("hire_date").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: suppliers
 * Logistics supplier profiles, reliability metrics, and speed.
 */
export const suppliers = mysqlTable("suppliers", {
  supplierId: int("supplier_id").primaryKey(),
  supplierCode: varchar("supplier_code", { length: 20 }).notNull().unique(),
  supplierName: varchar("supplier_name", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  leadTimeDays: int("lead_time_days").notNull(),
  reliabilityScore: decimal("reliability_score", { precision: 5, scale: 2 }).notNull(),
  country: varchar("country", { length: 50 }).notNull(),
  status: varchar("status", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: inventory
 * Raw material items, levels, and storage locations.
 */
export const inventory = mysqlTable("inventory", {
  itemId: int("item_id").primaryKey(),
  itemCode: varchar("item_code", { length: 20 }).notNull().unique(),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  quantityInStock: int("quantity_in_stock").notNull(),
  warehouseLocation: varchar("warehouse_location", { length: 20 }).notNull(),
  reorderLevel: int("reorder_level").notNull(),
  unitOfMeasure: varchar("unit_of_measure", { length: 20 }).notNull(),
  status: varchar("status", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: downtime_events
 * Records occurrences of mechanical faults and machine outages.
 */
export const downtimeEvents = mysqlTable("downtime_events", {
  eventId: int("event_id").primaryKey(),
  eventCode: varchar("event_code", { length: 20 }).notNull().unique(),
  machineId: int("machine_id")
    .notNull()
    .references(() => machines.machineId),
  startTime: datetime("start_time").notNull(),
  endTime: datetime("end_time"),
  durationMinutes: int("duration_minutes"),
  reason: varchar("reason", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: shift_logs
 * Clock-in records for operations employees.
 */
export const shiftLogs = mysqlTable("shift_logs", {
  shiftLogId: int("shift_log_id").primaryKey(),
  shiftCode: varchar("shift_code", { length: 20 }).notNull().unique(),
  employeeId: int("employee_id")
    .notNull()
    .references(() => employees.employeeId),
  shiftDate: date("shift_date").notNull(),
  shiftType: varchar("shift_type", { length: 10 }).notNull(),
  startTime: datetime("start_time").notNull(),
  endTime: datetime("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: maintenance_logs
 * Machine repairs and technical resolutions assigned to employees.
 */
export const maintenanceLogs = mysqlTable("maintenance_logs", {
  logId: int("log_id").primaryKey(),
  logCode: varchar("log_code", { length: 20 }).notNull().unique(),
  machineId: int("machine_id")
    .notNull()
    .references(() => machines.machineId),
  employeeId: int("employee_id")
    .notNull()
    .references(() => employees.employeeId),
  issueType: varchar("issue_type", { length: 50 }).notNull(),
  issueDescription: text("issue_description").notNull(),
  reportedTime: datetime("reported_time").notNull(),
  resolvedTime: datetime("resolved_time"),
  resolutionNotes: text("resolution_notes"),
  status: varchar("status", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: work_orders
 * Production order plans, target and output metrics.
 */
export const workOrders = mysqlTable("work_orders", {
  orderId: int("order_id").primaryKey(),
  workOrderNumber: varchar("work_order_number", { length: 20 }).notNull().unique(),
  machineId: int("machine_id")
    .notNull()
    .references(() => machines.machineId),
  itemId: int("item_id").references(() => inventory.itemId),
  productName: varchar("product_name", { length: 100 }).notNull(),
  quantityPlanned: int("quantity_planned").notNull(),
  quantityCompleted: int("quantity_completed").notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
  startTime: datetime("start_time").notNull(),
  endTime: datetime("end_time"),
  status: varchar("status", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: purchase_orders
 * Supplies restocking purchases, dates, and delivery status.
 */
export const purchaseOrders = mysqlTable("purchase_orders", {
  poId: int("po_id").primaryKey(),
  poNumber: varchar("po_number", { length: 20 }).notNull().unique(),
  supplierId: int("supplier_id")
    .notNull()
    .references(() => suppliers.supplierId),
  itemId: int("item_id")
    .notNull()
    .references(() => inventory.itemId),
  quantity: int("quantity").notNull(),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date").notNull(),
  actualDeliveryDate: date("actual_delivery_date"),
  status: varchar("status", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Table: quality_checks
 * Logs QC inspections, pass/fail status, and defects.
 */
export const qualityChecks = mysqlTable("quality_checks", {
  checkId: int("check_id").primaryKey(),
  qcCode: varchar("qc_code", { length: 20 }).notNull().unique(),
  machineId: int("machine_id")
    .notNull()
    .references(() => machines.machineId),
  workOrderId: int("work_order_id")
    .notNull()
    .references(() => workOrders.orderId),
  productName: varchar("product_name", { length: 100 }).notNull(),
  result: varchar("result", { length: 5 }).notNull(), // e.g. "PASS", "FAIL"
  defectType: varchar("defect_type", { length: 50 }),
  inspectionDate: datetime("inspection_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

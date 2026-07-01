/**
 * Operational DB (manufacturing_operations_db) Schemas and Descriptions.
 * All column names match physical MySQL snake_case representations exactly.
 */
export const TABLE_METADATA: Record<string, { description: string; ddl: string }> = {
  machines: {
    description: "Tracks machinery configurations, locations, lines, installation dates, and status.",
    ddl: `CREATE TABLE machines (
  machine_id INT NOT NULL,
  machine_code VARCHAR(20) NOT NULL UNIQUE,
  machine_name VARCHAR(100) NOT NULL,
  machine_type VARCHAR(50) NOT NULL,
  production_line VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  installation_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (machine_id)
);`
  },
  employees: {
    description: "Profiles operations employees, their roles, departments, and active statuses.",
    ddl: `CREATE TABLE employees (
  employee_id INT NOT NULL,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  employee_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  department VARCHAR(50) NOT NULL,
  hire_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (employee_id)
);`
  },
  suppliers: {
    description: "Profiles suppliers, lead times, countries, and calculated reliability scores.",
    ddl: `CREATE TABLE suppliers (
  supplier_id INT NOT NULL,
  supplier_code VARCHAR(20) NOT NULL UNIQUE,
  supplier_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  lead_time_days INT NOT NULL,
  reliability_score DECIMAL(5,2) NOT NULL,
  country VARCHAR(50) NOT NULL,
  status VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id)
);`
  },
  inventory: {
    description: "Stores stock counts, reorder alert levels, categories, and warehouse locations.",
    ddl: `CREATE TABLE inventory (
  item_id INT NOT NULL,
  item_code VARCHAR(20) NOT NULL UNIQUE,
  item_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity_in_stock INT NOT NULL,
  warehouse_location VARCHAR(20) NOT NULL,
  reorder_level INT NOT NULL,
  unit_of_measure VARCHAR(20) NOT NULL,
  status VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id)
);`
  },
  downtime_events: {
    description: "Logs machine outages, downtime duration, outage reason, and severity levels.",
    ddl: `CREATE TABLE downtime_events (
  event_id INT NOT NULL,
  event_code VARCHAR(20) NOT NULL UNIQUE,
  machine_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INT,
  reason VARCHAR(100) NOT NULL,
  severity VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);`
  },
  shift_logs: {
    description: "Logs shift login records and operator notes for operations employees.",
    ddl: `CREATE TABLE shift_logs (
  shift_log_id INT NOT NULL,
  shift_code VARCHAR(20) NOT NULL UNIQUE,
  employee_id INT NOT NULL,
  shift_date DATE NOT NULL,
  shift_type VARCHAR(10) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (shift_log_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);`
  },
  maintenance_logs: {
    description: "Logs machine fault repairs, resolutions, assigned employee, and resolution notes.",
    ddl: `CREATE TABLE maintenance_logs (
  log_id INT NOT NULL,
  log_code VARCHAR(20) NOT NULL UNIQUE,
  machine_id INT NOT NULL,
  employee_id INT NOT NULL,
  issue_type VARCHAR(50) NOT NULL,
  issue_description TEXT NOT NULL,
  reported_time DATETIME NOT NULL,
  resolved_time DATETIME,
  resolution_notes TEXT,
  status VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);`
  },
  work_orders: {
    description: "Stores planned vs completed item production numbers, priorities, and schedules.",
    ddl: `CREATE TABLE work_orders (
  order_id INT NOT NULL,
  work_order_number VARCHAR(20) NOT NULL UNIQUE,
  machine_id INT NOT NULL,
  item_id INT,
  product_name VARCHAR(100) NOT NULL,
  quantity_planned INT NOT NULL,
  quantity_completed INT NOT NULL,
  priority VARCHAR(10) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
  FOREIGN KEY (item_id) REFERENCES inventory(item_id)
);`
  },
  purchase_orders: {
    description: "Tracks restocking purchase orders, supplier reliability timelines, and delivery states.",
    ddl: `CREATE TABLE purchase_orders (
  po_id INT NOT NULL,
  po_number VARCHAR(20) NOT NULL UNIQUE,
  supplier_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  status VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (po_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  FOREIGN KEY (item_id) REFERENCES inventory(item_id)
);`
  },
  quality_checks: {
    description: "Logs quality checking inspection passes/failures and defect types for work orders.",
    ddl: `CREATE TABLE quality_checks (
  check_id INT NOT NULL,
  qc_code VARCHAR(20) NOT NULL UNIQUE,
  machine_id INT NOT NULL,
  work_order_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  result VARCHAR(5) NOT NULL,
  defect_type VARCHAR(50),
  inspection_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (check_id),
  FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
  FOREIGN KEY (work_order_id) REFERENCES work_orders(order_id)
);`
  }
};

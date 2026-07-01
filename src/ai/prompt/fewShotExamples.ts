export interface FewShotExample {
  question: string;
  sql: string;
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  {
    question: "Show all recent critical downtime outages for machine 1",
    sql: "SELECT event_id, machine_id, start_time, duration_minutes, reason FROM downtime_events WHERE machine_id = 1 AND severity = 'critical' ORDER BY start_time DESC LIMIT 10"
  },
  {
    question: "List open maintenance logs assigned to employee 123",
    sql: "SELECT log_id, machine_id, issue_type, reported_time, status FROM maintenance_logs WHERE employee_id = 123 AND status = 'OPEN' ORDER BY reported_time DESC LIMIT 20"
  },
  {
    question: "Find low stock items in category 'Chemicals' that need reordering",
    sql: "SELECT item_id, item_name, quantity_in_stock, reorder_level FROM inventory WHERE category = 'Chemicals' AND quantity_in_stock <= reorder_level LIMIT 50"
  },
  {
    question: "Get quality check failure rates for machine 5 last week",
    sql: "SELECT result, COUNT(check_id) AS check_count FROM quality_checks WHERE machine_id = 5 AND inspection_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) GROUP BY result LIMIT 10"
  },
  {
    question: "Who operators are currently active in Assembly line shift logs",
    sql: "SELECT DISTINCT s.employee_id, e.employee_name FROM shift_logs s JOIN employees e ON s.employee_id = e.employee_id WHERE s.shift_date = CURRENT_DATE() AND e.department = 'Assembly' LIMIT 30"
  },
  {
    question: "Find pending purchase orders from suppliers in Canada",
    sql: "SELECT p.po_id, p.po_number, p.quantity, s.supplier_name FROM purchase_orders p JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE s.country = 'Canada' AND p.status = 'PENDING' LIMIT 50"
  }
];

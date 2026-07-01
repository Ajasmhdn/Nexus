import { CHART_RULES } from "../../lib/constants";

export interface ChartDecision {
  renderChart: boolean;
  chartType: "bar" | "line" | "pie";
  xAxisKey: string;
  yAxisKey: string;
  data: Record<string, unknown>[];
}

/**
 * Heuristic chart decider based on query result rows.
 */
export function decideChart(rows: any[]): ChartDecision | null {
  const count = rows.length;

  // Rule: 0 rows or 1 row -> no chart
  if (count <= CHART_RULES.METRICS_ONLY_ROWS) {
    return null;
  }

  // Rule: >20 rows -> table only, no chart
  if (count > CHART_RULES.CHART_MAX_ROWS) {
    return null;
  }

  const sampleRow = rows[0] || {};
  const keys = Object.keys(sampleRow);

  // Find numeric fields (y-axis candidates)
  const numericKeys = keys.filter(key => {
    // Check if the value is a number for at least one row
    return rows.some(row => typeof row[key] === "number");
  });

  // Find categorical/date fields (x-axis candidates)
  const dateKeys = keys.filter(key => {
    const val = String(sampleRow[key]).toLowerCase();
    return key.toLowerCase().includes("date") || key.toLowerCase().includes("time") || /^\d{4}-\d{2}-\d{2}/.test(val);
  });

  const stringKeys = keys.filter(key => !numericKeys.includes(key));

  if (numericKeys.length === 0) {
    return null; // Can't draw a chart without numeric y-axis data
  }

  // Heuristics for selecting axis keys
  const yAxisKey = numericKeys[0];
  let xAxisKey = "";
  let isTemporal = false;

  if (dateKeys.length > 0) {
    xAxisKey = dateKeys[0];
    isTemporal = true;
  } else if (stringKeys.length > 0) {
    xAxisKey = stringKeys[0];
  } else {
    // Fallback: pick any other key
    xAxisKey = keys.find(k => k !== yAxisKey) || keys[0];
  }

  let chartType: "bar" | "line" | "pie" = "bar";

  // Heuristics for chart type selection
  if (count >= 2 && count <= CHART_RULES.PIE_MAX_ROWS) {
    // 2-4 rows: Pie chart is good for categorical distribution, else Bar
    chartType = isTemporal ? "bar" : "pie";
  } else if (count >= 5 && count <= CHART_RULES.CHART_MAX_ROWS) {
    // 5-20 rows: Line chart if temporal, else Bar chart
    chartType = isTemporal ? "line" : "bar";
  }

  // Format data as simple plain objects for recharts
  const chartData = rows.map(row => {
    const formatted: Record<string, unknown> = {};
    for (const key of keys) {
      const val = row[key];
      // Format dates nicely
      if (val instanceof Date) {
        formatted[key] = val.toISOString().slice(0, 10);
      } else {
        formatted[key] = val;
      }
    }
    return formatted;
  });

  return {
    renderChart: true,
    chartType,
    xAxisKey,
    yAxisKey,
    data: chartData
  };
}

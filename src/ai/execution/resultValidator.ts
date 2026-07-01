import { MAX_QUERY_ROWS, NULL_DENSITY_WARN_THRESHOLD } from "../../lib/constants";

export interface ResultValidationReport {
  empty: boolean;
  truncated: boolean;
  warnings: string[];
  processedRows: any[];
}

/**
 * Validates the raw SQL query results for anomalies, null densities, outlier metrics, and caps sizes.
 */
export function validateResults(rows: any[]): ResultValidationReport {
  const report: ResultValidationReport = {
    empty: false,
    truncated: false,
    warnings: [],
    processedRows: rows
  };

  // Check 1: Empty check
  if (!rows || rows.length === 0) {
    report.empty = true;
    report.warnings.push("No data matching your query criteria was found in the database.");
    return report;
  }

  // Check 2: Row limit cap / Truncation check
  if (rows.length > MAX_QUERY_ROWS) {
    report.truncated = true;
    report.processedRows = rows.slice(0, MAX_QUERY_ROWS);
    report.warnings.push(`Result set size exceeded limits and was truncated to the first ${MAX_QUERY_ROWS} records.`);
  }

  // Calculate metrics for numeric fields, null density, and outliers
  const totalCells = report.processedRows.length * Object.keys(report.processedRows[0] || {}).length;
  let nullCells = 0;

  const numericKeys = Object.keys(report.processedRows[0] || {}).filter(key => {
    return report.processedRows.some(row => {
      const val = row[key];
      return val !== null && val !== undefined && typeof val === "number";
    });
  });

  // Calculate outlier thresholds using IQR (Interquartile Range) for numeric columns
  const numericStats: Record<string, { q1: number; q3: number; iqr: number; minLimit: number; maxLimit: number }> = {};
  for (const key of numericKeys) {
    const values = report.processedRows
      .map(row => row[key])
      .filter(val => val !== null && val !== undefined && typeof val === "number")
      .sort((a, b) => a - b);
    
    if (values.length >= 4) {
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      numericStats[key] = {
        q1,
        q3,
        iqr,
        minLimit: q1 - 1.5 * iqr,
        maxLimit: q3 + 1.5 * iqr
      };
    }
  }

  // Check 4 & 5: Scan nulls and outliers
  const detectedOutliers = new Set<string>();
  for (const row of report.processedRows) {
    for (const key of Object.keys(row)) {
      if (row[key] === null || row[key] === undefined) {
        nullCells++;
      } else if (numericStats[key]) {
        const val = row[key];
        const stats = numericStats[key];
        if (val < stats.minLimit || val > stats.maxLimit) {
          detectedOutliers.add(key);
        }
      }
    }
  }

  // Check 4: Null density warning
  if (totalCells > 0) {
    const nullDensity = nullCells / totalCells;
    if (nullDensity >= NULL_DENSITY_WARN_THRESHOLD) {
      report.warnings.push(`High density of null values detected (${Math.round(nullDensity * 100)}% of matching records are empty).`);
    }
  }

  // Check 5: Outlier warning
  if (detectedOutliers.size > 0) {
    report.warnings.push(`Extreme outlier values detected in fields: ${Array.from(detectedOutliers).join(", ")}.`);
  }

  return report;
}

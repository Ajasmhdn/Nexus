import { ALLOWED_TABLES, BLOCKED_SQL_KEYWORDS } from "../../lib/constants";

export interface ValidationResult {
  valid: boolean;
  sql: string;
  failedLayer?: number;
  reason?: string;
}

/**
 * Validates the generated SQL statement for read-only security safety.
 * Zero LLM dependency - Pure TypeScript execution.
 */
export function validateSql(sql: string): ValidationResult {
  const trimmed = sql.trim();

  // Layer 1: Enforce SELECT or WITH start
  const upperTrimmed = trimmed.toUpperCase();
  if (!upperTrimmed.startsWith("SELECT") && !upperTrimmed.startsWith("WITH")) {
    return {
      valid: false,
      sql,
      failedLayer: 1,
      reason: "Query must start with SELECT or WITH."
    };
  }

  // Layer 2: Reject blocked keywords anywhere in the query
  const upperSql = trimmed.toUpperCase();
  for (const keyword of BLOCKED_SQL_KEYWORDS) {
    // Check with word boundary to avoid false positives (e.g. "alter" inside "alternative")
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(upperSql)) {
      return {
        valid: false,
        sql,
        failedLayer: 2,
        reason: `Blocked SQL keyword detected: ${keyword}.`
      };
    }
  }

  // Layer 3: DML scan inside CTEs and subqueries (covered by Layer 2's global blocklist regex)
  // Let's explicitly look for common SQL injection characters or multiple statements (semicolon + commands)
  if (trimmed.includes(";")) {
    const parts = trimmed.split(";").map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return {
        valid: false,
        sql,
        failedLayer: 3,
        reason: "Multiple SQL statements separated by semicolons are blocked."
      };
    }
  }

  // Layer 4: Table Allowlist verification
  // A. Extract CTE definitions (e.g., WITH cte_name AS (...))
  const cteRegex = /(?:with|,)\s+`?([a-zA-Z0-9_]+)`?\s+as\s*\(/gi;
  const localCtes = new Set<string>();
  let cteMatch;
  while ((cteMatch = cteRegex.exec(trimmed)) !== null) {
    if (cteMatch[1]) {
      localCtes.add(cteMatch[1].toLowerCase());
    }
  }

  // B. Extract all referenced tables following FROM or JOIN
  const tableRefRegex = /(?:from|join)\s+`?([a-zA-Z0-9_]+)`?/gi;
  const referencedTables = new Set<string>();
  let tableMatch;
  while ((tableMatch = tableRefRegex.exec(trimmed)) !== null) {
    if (tableMatch[1]) {
      referencedTables.add(tableMatch[1].toLowerCase());
    }
  }

  // C. Validate that any table ref that is NOT a local CTE is inside ALLOWED_TABLES
  const allowedSet = new Set(ALLOWED_TABLES.map(t => t.toLowerCase()));
  for (const refTable of referencedTables) {
    if (localCtes.has(refTable)) {
      continue; // Skip local CTE aliases
    }
    if (!allowedSet.has(refTable)) {
      return {
        valid: false,
        sql,
        failedLayer: 4,
        reason: `Table ref '${refTable}' is not in the approved database allowlist.`
      };
    }
  }

  // Layer 5: Inject LIMIT 500 if no LIMIT is present
  let finalSql = trimmed;
  if (!/\bLIMIT\b/i.test(trimmed)) {
    // Strip trailing semicolon if present to append LIMIT
    if (finalSql.endsWith(";")) {
      finalSql = finalSql.slice(0, -1);
    }
    finalSql = `${finalSql} LIMIT 500`;
  }

  return {
    valid: true,
    sql: finalSql
  };
}

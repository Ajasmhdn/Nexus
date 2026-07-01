import { agentPool } from "../../lib/db/agent-pool";
import { SQL_EXECUTION_TIMEOUT_MS } from "../../lib/constants";

export interface ExecutionResult {
  rows: any[];
  executionTimeMs: number;
  error?: string;
}

/**
 * Executes a validated SQL statement on the read-only Operational DB.
 * Implements a strict timeout of 30 seconds.
 */
export async function executeSql(sql: string): Promise<ExecutionResult> {
  const startTime = performance.now();

  const queryPromise = agentPool.query(sql).then(([rows]) => rows as any[]);
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`SQL execution timed out after ${SQL_EXECUTION_TIMEOUT_MS}ms`));
    }, SQL_EXECUTION_TIMEOUT_MS);
  });

  try {
    const rows = await Promise.race([queryPromise, timeoutPromise]);
    const endTime = performance.now();
    return {
      rows,
      executionTimeMs: Math.round(endTime - startTime)
    };
  } catch (error: any) {
    const endTime = performance.now();
    return {
      rows: [],
      executionTimeMs: Math.round(endTime - startTime),
      error: error.message || String(error)
    };
  }
}

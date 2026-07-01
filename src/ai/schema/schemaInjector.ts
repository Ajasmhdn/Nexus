import { TABLE_METADATA } from "./metadata";
import { MAX_SCHEMA_TABLES } from "../../lib/constants";

/**
 * Injects DDL schemas for the target tables into the context prompt.
 * Restricts injected tables strictly up to the MAX_SCHEMA_TABLES hard limit (3 tables).
 */
export function injectSchema(tableNames: string[]): string {
  // Enforce the hard cap
  const targetTables = tableNames.slice(0, MAX_SCHEMA_TABLES);

  let schemaContext = "";
  for (const tableName of targetTables) {
    const meta = TABLE_METADATA[tableName];
    if (meta) {
      schemaContext += `\n-- Table: ${tableName}\n-- Description: ${meta.description}\n${meta.ddl}\n`;
    }
  }

  return schemaContext;
}

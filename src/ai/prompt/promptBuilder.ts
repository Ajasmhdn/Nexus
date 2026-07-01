import { SYSTEM_PROMPT } from "./systemPrompt";
import { FEW_SHOT_EXAMPLES } from "./fewShotExamples";

/**
 * Assembles the full SQL generation context.
 * 
 * Assembly sequence:
 * 1. System rules
 * 2. Business rules
 * 3. DDL schema context
 * 4. Few-shot Q->SQL pairs
 * 5. Session memory (last 6 message pairs)
 * 6. Current user question
 */
export function buildPrompt(
  ddlSchema: string,
  question: string,
  memoryHistory: string = ""
): string {
  const businessRules = `Business Rules & Guidelines:
- Active records: When querying tables (machines, employees, suppliers, inventory), filter for active records by adding status filter checks (e.g. status = 'ACTIVE' or is_active = true) unless specified otherwise.
- Downtime events: duration_minutes is NULL if the outage is currently ongoing (end_time is NULL).
- Shift logs: shift_type has values like 'DAY', 'NIGHT', 'SWING'.`;

  let fewShotsBlock = "Examples:\n";
  for (const example of FEW_SHOT_EXAMPLES) {
    fewShotsBlock += `Question: ${example.question}\nSQL: ${example.sql}\n\n`;
  }

  let prompt = `${SYSTEM_PROMPT}\n\n`;
  prompt += `${businessRules}\n\n`;
  prompt += `Database Schema (DDL):\n${ddlSchema}\n\n`;
  prompt += `${fewShotsBlock}`;
  
  if (memoryHistory) {
    prompt += `Session Query History:\n${memoryHistory}\n\n`;
  }

  prompt += `Current User Question: ${question}\nSQL:`;

  return prompt;
}

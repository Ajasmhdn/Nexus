import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { decideChart } from "./chartDecider";
import { ContentBlock, SqlBlock, SummaryBlock, TableBlock, ChartBlock, MetricBlock, InsightBlock } from "../../types";

const synthesizerOutputSchema = z.object({
  summary: z.string().describe("A concise natural language summary explaining what the data shows in response to the user's question."),
  insights: z.array(z.string()).describe("Key operational insights or warnings derived from this data. Keep them short."),
  metrics: z.array(z.object({
    label: z.string().describe("The name/label of the metric."),
    value: z.string().describe("The formatted value (e.g. '120 mins', 'Canada', '89.4%')."),
    trend: z.enum(["up", "down", "neutral"]).optional(),
    trendValue: z.string().optional()
  })).describe("Summary KPI metrics or highlights for single row values.")
});

export interface ResponseBuilderInput {
  query: string;
  sql: string;
  rows: any[];
  executionTimeMs: number;
  warnings?: string[];
}

/**
 * Synthesizes the database query results into structured ContentBlock[] array.
 * Model: gemini-2.5-flash, Temp: 0.3.
 */
export async function buildResponse(input: ResponseBuilderInput): Promise<ContentBlock[]> {
  const { query, sql, rows, executionTimeMs, warnings = [] } = input;

  const blocks: ContentBlock[] = [];

  // 1. If empty results, construct empty summary & table block early
  if (rows.length === 0) {
    blocks.push({
      id: uuidv4(),
      type: "summary",
      title: "No Data Found",
      content: "The query executed successfully but did not return any records matching your criteria."
    });
    blocks.push({
      id: uuidv4(),
      type: "sql",
      query,
      explanation: "No database rows returned."
    } as any); // Type cast since it's SqlBlock
    return blocks;
  }

  // Pick highest performance model available: gemini-2.5-flash
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.3,
    maxRetries: 2
  });

  const sampleRowsJson = JSON.stringify(rows.slice(0, 10), null, 2);

  const systemInstruction = `You are an operations data analyst synthesizing SQL database query results.
Review the user's question, the SQL query executed, and the sample database rows.
Provide a clear, brief summary explaining the results, pull out key numerical metrics, and list 1-3 business insights.`;

  const promptText = `User Question: "${query}"
SQL Executed: "${sql}"
Raw Data Rows Count: ${rows.length}
Sample Data Rows:
${sampleRowsJson}`;

  let summary = "";
  let insights: string[] = [];
  let metricsList: any[] = [];

  try {
    const structuredModel = model.withStructuredOutput(synthesizerOutputSchema);
    const result = await structuredModel.invoke([
      { role: "system", content: systemInstruction },
      { role: "user", content: promptText }
    ]);

    summary = result.summary || "";
    insights = result.insights || [];
    metricsList = result.metrics || [];
  } catch (error) {
    console.error("Synthesizer failed, falling back:", error);
    summary = `Retrieved ${rows.length} rows from the operational database matching your request.`;
  }

  // Assemble blocks in the STRICT pipeline order:
  
  // 1. SummaryBlock
  blocks.push({
    id: uuidv4(),
    type: "summary",
    title: "SQL Analysis Summary",
    content: summary
  } as SummaryBlock);

  // 2. SqlBlock (+ optimization explanation)
  blocks.push({
    id: uuidv4(),
    type: "sql",
    query: sql,
    explanation: `Executed in ${executionTimeMs}ms.`
  } as SqlBlock);

  // 3. InsightBlock (if warnings or generated insights exist)
  const combinedInsights = [...warnings, ...insights];
  if (combinedInsights.length > 0) {
    // We can join them or create individual blocks.
    // The spec requests "InsightBlock" containing the insights.
    // Let's create one warning/info insight block representing the list.
    blocks.push({
      id: uuidv4(),
      type: "insight",
      variant: warnings.length > 0 ? "warning" : "info",
      content: combinedInsights.map(ins => `• ${ins}`).join("\n")
    } as InsightBlock);
  }

  // 4. MetricBlock (if 1 row, aggregates, or metrics list generated)
  if (metricsList.length > 0) {
    blocks.push({
      id: uuidv4(),
      type: "metrics",
      items: metricsList
    } as MetricBlock);
  }

  // 5. TableBlock (capped at 500 rows)
  const headers = Object.keys(rows[0] || {});
  const tableRows = rows.slice(0, 500).map(row => {
    return headers.map(header => {
      const val = row[header];
      if (val instanceof Date) {
        return val.toISOString().slice(0, 10);
      }
      return val === null || val === undefined ? "" : String(val);
    });
  });

  blocks.push({
    id: uuidv4(),
    type: "table",
    headers,
    rows: tableRows,
    caption: `Showing ${tableRows.length} of ${rows.length} records.`
  } as TableBlock);

  // 6. ChartBlock (if chart decider heuristic is met)
  const chartConfig = decideChart(rows);
  if (chartConfig) {
    blocks.push({
      id: uuidv4(),
      type: "chart",
      chartType: chartConfig.chartType,
      title: `${chartConfig.yAxisKey} by ${chartConfig.xAxisKey}`,
      xAxisKey: chartConfig.xAxisKey,
      yAxisKey: chartConfig.yAxisKey,
      data: chartConfig.data
    } as ChartBlock);
  }

  return blocks;
}

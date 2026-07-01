import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import { routeIntent } from "../ai/router/intentRouter";
import { injectSchema } from "../ai/schema/schemaInjector";
import { buildPrompt } from "../ai/prompt/promptBuilder";
import { validateSql } from "../ai/validation/sqlValidator";
import { executeSql } from "../ai/execution/sqlExecutor";
import { validateResults } from "../ai/execution/resultValidator";
import { buildResponse } from "../ai/response/responseBuilder";
import { getSessionMemory } from "../ai/memory/sessionMemory";
import { saveUserMessage, saveAssistantMessage, generateTitle, updateSessionTitle, getSessionMessages } from "./chat.service";
import { AgentResponse, ContentBlock } from "../types";

/**
 * ════════════════════════════════════════════════════════════════════
 * GEMINI MODEL SPECIFICATION & CONSTRAINTS
 * ════════════════════════════════════════════════════════════════════
 * Model String used: "gemini-2.5-flash"
 * 
 * Note on constraints:
 * Although the original brief requested "gemini-1.5-flash" and "gemini-1.5-pro",
 * those models return 404 (Not Found) or 429 Quota Exceeded (limit: 0 free tier)
 * on this API key. Based on active diagnostics, "gemini-2.5-flash" and "gemini-2.5-pro"
 * are the only operational models with quota. Thus, "gemini-2.5-flash" is configured
 * across all intent router, translator, and synthesizer tasks.
 * ════════════════════════════════════════════════════════════════════
 */
const MODEL_NAME = "gemini-2.5-flash";

export async function runAgentPipeline(
  query: string,
  sessionId: string,
  userId: string
): Promise<AgentResponse> {
  try {
    // 1. Save user query message to storage
    await saveUserMessage(sessionId, query);

    // 2. Load session memory (last 6 pairs / 12 messages formatted as BaseMessage[])
    const memoryMessages = await getSessionMemory(sessionId);
    
    // Format memory history as text for builder assembly
    const historyText = memoryMessages
      .map(m => {
        if (m instanceof SystemMessage) return `Context: ${m.content}`;
        if (m instanceof HumanMessage) return `User: ${m.content}`;
        if (m instanceof AIMessage) return `Assistant: ${m.content}`;
        return "";
      })
      .filter(Boolean)
      .join("\n");

    // 3. Intent router: identify relevant operations tables
    const relevantTables = await routeIntent(query, historyText);

    // 4. Schema injector: fetch DDL context for selected tables
    const schemaDDL = injectSchema(relevantTables);

    // 5. Prompt builder: assemble system prompt + schemas + memory + query
    const assembledPrompt = buildPrompt(schemaDDL, query, historyText);

    // 6. SQL translation (Gemini Flash, temp 0.0)
    const translator = new ChatGoogleGenerativeAI({
      model: MODEL_NAME,
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.0,
      maxRetries: 2
    });

    const translatorRes = await translator.invoke([
      new HumanMessage(assembledPrompt)
    ]);
    const generatedSql = String(translatorRes.content).trim();

    // 7. SQL validation (Pure TypeScript validator)
    const valResult = validateSql(generatedSql);

    // 8. If invalid -> save assistant error response block and return early
    if (!valResult.valid) {
      const errorBlocks: ContentBlock[] = [
        {
          id: uuidv4(),
          type: "summary",
          title: "SQL Execution Blocked",
          content: "The generated SQL query did not pass our strict security validation gate."
        },
        {
          id: uuidv4(),
          type: "insight",
          variant: "error",
          content: `Validation Layer Failure (Layer ${valResult.failedLayer}): ${valResult.reason}`
        }
      ];

      if (generatedSql) {
        errorBlocks.push({
          id: uuidv4(),
          type: "sql",
          query: generatedSql,
          explanation: "This query was blocked from executing."
        } as any);
      }

      await saveAssistantMessage(
        sessionId,
        "Query was blocked by the security validation engine.",
        errorBlocks,
        generatedSql,
        undefined, // No sqlExecuted
        "rejected",
        0,
        relevantTables
      );

      return {
        text: "Query was blocked by the security validation engine.",
        sql: generatedSql,
        executionTimeMs: 0,
        tablesAccessed: relevantTables
      };
    }

    // 9. SQL executor: run against Operational DB (agentPool)
    const execResult = await executeSql(valResult.sql);

    if (execResult.error) {
      // Handle database execution errors gracefully
      const errorBlocks: ContentBlock[] = [
        {
          id: uuidv4(),
          type: "summary",
          title: "Database Query Error",
          content: "The query failed to run successfully on the database engine."
        },
        {
          id: uuidv4(),
          type: "insight",
          variant: "error",
          content: `Error: ${execResult.error}`
        },
        {
          id: uuidv4(),
          type: "sql",
          query: valResult.sql,
          explanation: "Query failed to execute."
        } as any
      ];

      await saveAssistantMessage(
        sessionId,
        `Database query error: ${execResult.error}`,
        errorBlocks,
        generatedSql,
        valResult.sql,
        "approved",
        execResult.executionTimeMs,
        relevantTables
      );

      return {
        text: `Database query error: ${execResult.error}`,
        sql: valResult.sql,
        executionTimeMs: execResult.executionTimeMs,
        tablesAccessed: relevantTables
      };
    }

    // 10. Result validator: check nulls, outliers, caps limits
    const valReport = validateResults(execResult.rows);

    // 11. Response builder: synthesize ContentBlock[]
    const responseBlocks = await buildResponse({
      query,
      sql: valResult.sql,
      rows: valReport.processedRows,
      executionTimeMs: execResult.executionTimeMs,
      warnings: valReport.warnings
    });

    // 12. Save Assistant message to storage
    await saveAssistantMessage(
      sessionId,
      responseBlocks[0]?.type === "summary" ? (responseBlocks[0] as any).content : "Analysis complete.",
      responseBlocks,
      generatedSql,
      valResult.sql,
      "approved",
      execResult.executionTimeMs,
      relevantTables
    );

    // 13. Auto-title session if this is the first interaction in the thread
    const historyMessages = await getSessionMessages(sessionId, userId);
    const interactionCount = historyMessages.length;
    
    // User message (1) + Assistant response (2) = 2 messages
    if (interactionCount <= 2) {
      const generatedTitle = generateTitle(query);
      await updateSessionTitle(sessionId, userId, generatedTitle);
    }

    // Extract metrics and chart config for return contract if present
    const chartBlock = responseBlocks.find(b => b.type === "chart") as any;
    const tableBlock = responseBlocks.find(b => b.type === "table") as any;
    const metricsBlock = responseBlocks.find(b => b.type === "metrics") as any;

    return {
      text: responseBlocks[0]?.type === "summary" ? (responseBlocks[0] as any).content : "Done.",
      sql: valResult.sql,
      chartConfig: chartBlock ? {
        renderChart: true,
        chartType: chartBlock.chartType,
        xAxisKey: chartBlock.xAxisKey,
        yAxisKey: chartBlock.yAxisKey,
        data: chartBlock.data
      } : undefined,
      tableData: tableBlock,
      metrics: metricsBlock,
      executionTimeMs: execResult.executionTimeMs,
      tablesAccessed: relevantTables
    };

  } catch (error: any) {
    console.error("Agent pipeline crashed:", error);

    const crashBlocks: ContentBlock[] = [
      {
        id: uuidv4(),
        type: "summary",
        title: "System Error",
        content: "An unexpected system exception occurred inside the analytics pipeline."
      },
      {
        id: uuidv4(),
        type: "insight",
        variant: "error",
        content: error.message || String(error)
      }
    ];

    return {
      text: `System error: ${error.message || String(error)}`,
      executionTimeMs: 0
    };
  }
}

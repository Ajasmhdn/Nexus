import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { ALLOWED_TABLES } from "../../lib/constants";

const routerOutputSchema = z.object({
  tables: z.array(z.enum(ALLOWED_TABLES))
    .max(3)
    .describe("List of relevant database tables needed to answer the user query.")
});

/**
 * Routes the user's natural language query to the relevant database tables.
 * Uses gemini-1.5-flash with structured output.
 */
export async function routeIntent(query: string, history: string = ""): Promise<string[]> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.0,
    maxRetries: 2
  });

  const systemInstruction = `You are a database intent router for a manufacturing operations DB.
Your job is to analyze the user query and identify which tables are relevant.
Select at most 3 tables from this list: ${ALLOWED_TABLES.join(", ")}.

If the query is ambiguous, return the top 2 most likely tables.
Only return tables that exist in the list.`;

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: `Session History:\n${history}\n\nUser Question:\n${query}` }
  ];

  try {
    const structuredModel = model.withStructuredOutput(routerOutputSchema);
    const result = await structuredModel.invoke(messages);
    
    let selected = result?.tables || [];
    selected = Array.from(new Set(selected));
    if (selected.length === 0) {
      selected = ["machines", "downtime_events"]; // Fallback
    }
    return selected.slice(0, 3);
  } catch (error) {
    console.error("Router error, executing fallback:", error);
    return ["machines", "downtime_events"]; // Fallback
  }
}

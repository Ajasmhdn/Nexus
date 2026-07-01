import { db } from "../../lib/db/app-pool";
import { messages as messagesTable } from "../../lib/db/schema/app.schema";
import { eq, asc } from "drizzle-orm";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Loads and structures history memory for a chat session.
 * Keeps the last 6 pairs of dialogue explicit, and summarizes any older context.
 */
export async function getSessionMemory(sessionId: string): Promise<BaseMessage[]> {
  const dbMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(asc(messagesTable.createdAt));

  if (dbMessages.length === 0) {
    return [];
  }

  // A pair consists of 1 user message + 1 assistant message.
  // 6 pairs = 12 messages.
  const EXPLICIT_LIMIT = 12;

  let explicitMessages = dbMessages;
  let olderMessages: any[] = [];

  if (dbMessages.length > EXPLICIT_LIMIT) {
    olderMessages = dbMessages.slice(0, dbMessages.length - EXPLICIT_LIMIT);
    explicitMessages = dbMessages.slice(dbMessages.length - EXPLICIT_LIMIT);
  }

  const memoryMessages: BaseMessage[] = [];

  // If there are older messages, summarize them into a single context paragraph
  if (olderMessages.length > 0) {
    try {
      const summaryModel = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.1
      });

      const textToSummarize = olderMessages
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      const summaryResponse = await summaryModel.invoke([
        new SystemMessage("Summarize the following historical conversation between a User and an Assistant in a single concise paragraph. Focus on the main topics discussed and tables queried."),
        new HumanMessage(textToSummarize)
      ]);

      const summaryText = String(summaryResponse.content);
      memoryMessages.push(new SystemMessage(`Summary of previous conversation context:\n${summaryText}`));
    } catch (error) {
      console.error("Older message summarization failed, skipping older memory:", error);
    }
  }

  // Format the explicit messages as LangChain history messages
  for (const msg of explicitMessages) {
    if (msg.role === "user") {
      memoryMessages.push(new HumanMessage(msg.content));
    } else {
      memoryMessages.push(new AIMessage(msg.content));
    }
  }

  return memoryMessages;
}

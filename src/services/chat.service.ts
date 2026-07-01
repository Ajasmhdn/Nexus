import { db } from "../lib/db/app-pool";
import { chatSessions, messages } from "../lib/db/schema/app.schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../lib/errors";

export interface ChatSessionDTO {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

export interface SessionGroup {
  label: string;
  conversations: ChatSessionDTO[];
}

/**
 * pure text-only title generator (zero API calls)
 */
export function generateTitle(msg: string): string {
  return msg.trim()
    .slice(0, 60)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim() || 'New Conversation';
}

/**
 * Service to manage database storage of chat sessions and message histories.
 * Scoped strictly by userId to enforce multi-tenant separation.
 */

export async function createSession(userId: string, title: string = "New Conversation"): Promise<string> {
  const sessionId = uuidv4();
  await db.insert(chatSessions).values({
    sessionId,
    userId,
    title,
    isDeleted: false,
  });
  return sessionId;
}

export async function listSessions(userId: string): Promise<ChatSessionDTO[]> {
  const sessions = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.userId, userId), eq(chatSessions.isDeleted, false)))
    .orderBy(desc(chatSessions.updatedAt));

  // For each session, fetch the last message to get a preview
  const dtos: ChatSessionDTO[] = [];
  for (const s of sessions) {
    const [lastMsg] = await db
      .select({ content: messages.content })
      .from(messages)
      .where(eq(messages.sessionId, s.sessionId))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    dtos.push({
      id: s.sessionId,
      title: s.title,
      timestamp: s.updatedAt,
      preview: lastMsg?.content || "No messages yet."
    });
  }
  return dtos;
}

export async function getSessionMessages(sessionId: string, userId: string): Promise<any[]> {
  // Validate ownership first
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.sessionId, sessionId))
    .limit(1);

  if (!session) {
    throw new AppError("Conversation not found.", 404, "SESSION_NOT_FOUND");
  }

  if (session.userId !== userId) {
    throw new AppError("Access denied to this conversation thread.", 403, "SESSION_ACCESS_DENIED");
  }

  const dbMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.createdAt));

  return dbMessages.map(m => {
    let parsedBlocks = null;
    if (m.blocks) {
      try {
        parsedBlocks = typeof m.blocks === "string" ? JSON.parse(m.blocks) : m.blocks;
      } catch (err) {
        console.error("Error parsing stored blocks JSON:", err);
      }
    }
    return {
      messageId: m.messageId,
      sessionId: m.sessionId,
      role: m.role,
      content: m.content,
      blocks: parsedBlocks,
      generatedSql: m.generatedSql,
      sqlExecuted: m.sqlExecuted,
      sqlValidationStatus: m.sqlValidationStatus,
      executionTimeMs: m.executionTimeMs,
      tablesAccessed: m.tablesAccessed,
      createdAt: m.createdAt
    };
  });
}

export async function saveUserMessage(sessionId: string, content: string): Promise<void> {
  const messageId = uuidv4();
  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      messageId,
      sessionId,
      role: "user",
      content,
    });
    // Bump updatedAt in chat session
    await tx
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.sessionId, sessionId));
  });
}

export async function saveAssistantMessage(
  sessionId: string,
  content: string,
  blocks: any[],
  generatedSql?: string,
  sqlExecuted?: string,
  sqlValidationStatus?: "approved" | "optimized" | "rejected",
  executionTimeMs?: number,
  tablesAccessed?: string[]
): Promise<void> {
  const messageId = uuidv4();
  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      messageId,
      sessionId,
      role: "assistant",
      content,
      blocks, // JSON field mapped in Drizzle
      generatedSql,
      sqlExecuted,
      sqlValidationStatus,
      executionTimeMs,
      tablesAccessed,
    });
    // Bump updatedAt in chat session
    await tx
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.sessionId, sessionId));
  });
}

export async function softDeleteSession(sessionId: string, userId: string): Promise<void> {
  // Validate ownership first
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.sessionId, sessionId))
    .limit(1);

  if (!session) {
    throw new AppError("Conversation not found.", 404, "SESSION_NOT_FOUND");
  }

  if (session.userId !== userId) {
    throw new AppError("Access denied to this conversation thread.", 403, "SESSION_ACCESS_DENIED");
  }

  await db
    .update(chatSessions)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(chatSessions.sessionId, sessionId));
}

export async function updateSessionTitle(sessionId: string, userId: string, title: string): Promise<void> {
  // Validate ownership first
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.sessionId, sessionId))
    .limit(1);

  if (!session) {
    throw new AppError("Conversation not found.", 404, "SESSION_NOT_FOUND");
  }

  if (session.userId !== userId) {
    throw new AppError("Access denied to this conversation thread.", 403, "SESSION_ACCESS_DENIED");
  }

  await db
    .update(chatSessions)
    .set({ title, updatedAt: new Date() })
    .where(eq(chatSessions.sessionId, sessionId));
}

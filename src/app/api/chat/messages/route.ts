import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { handleApiError, AppError } from "@/lib/errors";
import { runAgentPipeline } from "@/services/agent.service";

// Next.js config to allow long-running AI pipeline tasks up to 30s
export const maxDuration = 30;

/**
 * POST /api/chat/messages
 * Submits a natural language query, runs the AI multi-agent SQL pipeline, and returns the response.
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AppError("Unauthorized. Please log in.", 401, "UNAUTHORIZED");
    }

    const { sessionId, content } = await request.json();
    if (!sessionId || !content) {
      throw new AppError("Missing sessionId or content query in request body.", 400, "BAD_REQUEST");
    }

    const response = await runAgentPipeline(content, sessionId, currentUser.userId);

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

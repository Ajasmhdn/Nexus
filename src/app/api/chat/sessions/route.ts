import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { handleApiError, AppError } from "@/lib/errors";
import { createSession, listSessions } from "@/services/chat.service";

/**
 * GET /api/chat/sessions
 * Retrieves all active conversations for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AppError("Unauthorized. Please log in.", 401, "UNAUTHORIZED");
    }

    const sessions = await listSessions(currentUser.userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/chat/sessions
 * Creates a new conversation thread for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AppError("Unauthorized. Please log in.", 401, "UNAUTHORIZED");
    }

    const sessionId = await createSession(currentUser.userId, "New Conversation");
    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

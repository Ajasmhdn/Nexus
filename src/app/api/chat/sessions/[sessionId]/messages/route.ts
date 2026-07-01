import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { handleApiError, AppError } from "@/lib/errors";
import { getSessionMessages } from "@/services/chat.service";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * GET /api/chat/sessions/[sessionId]/messages
 * Loads full dialogue message history for a target conversation. Scopes ownership.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AppError("Unauthorized. Please log in.", 401, "UNAUTHORIZED");
    }

    const { sessionId } = await params;
    const messages = await getSessionMessages(sessionId, currentUser.userId);

    return NextResponse.json({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}

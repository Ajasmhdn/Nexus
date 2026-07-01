import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { handleApiError, AppError } from "@/lib/errors";
import { softDeleteSession } from "@/services/chat.service";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * DELETE /api/chat/sessions/[sessionId]
 * Soft deletes the target conversation. Checks ownership boundaries.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AppError("Unauthorized. Please log in.", 401, "UNAUTHORIZED");
    }

    const { sessionId } = await params;
    await softDeleteSession(sessionId, currentUser.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

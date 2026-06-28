import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth/get-current-user";
import { handleApiError, AppError } from "../../../../lib/errors";
import { db } from "../../../../lib/db/app-pool";
import { users } from "../../../../lib/db/schema/app.schema";
import { eq } from "drizzle-orm";

/**
 * API Route: GET /api/auth/me
 * Retrieves current authenticated user session data, looking up live DB states.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    
    if (!session) {
      throw new AppError("Access denied. Please authenticate first.", 401, "UNAUTHORIZED");
    }

    // Look up fresh user profile fields from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, session.userId));

    if (!user || !user.isActive) {
      throw new AppError("User account not found or deactivated.", 401, "UNAUTHORIZED");
    }

    return NextResponse.json({
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        role: user.role,
        forcePasswordReset: user.forcePasswordReset
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

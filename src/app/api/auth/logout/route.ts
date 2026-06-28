import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth/get-current-user";
import { logLogout } from "../../../../services/auth.service";
import { clearAuthCookie } from "../../../../lib/auth/jwt";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/logout
 * Clears user session cookie and records the logout event.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      await logLogout(user.userId);
    }
    
    await clearAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    return handleApiError(error);
  }
}

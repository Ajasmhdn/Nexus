import { NextRequest, NextResponse } from "next/server";
import { resetConfirmSchema } from "../../../../lib/validators/auth.validators";
import { confirmForgotPassword } from "../../../../services/auth.service";
import { verifyToken, clearResetCookie } from "../../../../lib/auth/jwt";
import { AppError, handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/reset-confirm
 * Completes password reset by verifying reset_token cookie and applying the new password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod Validation
    const validatedData = resetConfirmSchema.parse(body);
    const { newPassword } = validatedData;

    // Read reset_token cookie
    const resetToken = request.cookies.get("reset_token")?.value;
    if (!resetToken) {
      throw new AppError("Access denied. Invalid or expired password reset session.", 401, "UNAUTHORIZED");
    }

    // Verify JWT
    const decoded = await verifyToken(resetToken);
    if (!decoded || decoded.purpose !== "password_reset") {
      throw new AppError("Access denied. Invalid or expired password reset session.", 401, "UNAUTHORIZED");
    }

    // Apply password change
    await confirmForgotPassword(decoded.userId, newPassword);

    // Clear reset_token cookie
    await clearResetCookie();

    return NextResponse.json({
      success: true,
      message: "Password reset completed successfully. Please sign in with your new password."
    });
  } catch (error) {
    return handleApiError(error);
  }
}

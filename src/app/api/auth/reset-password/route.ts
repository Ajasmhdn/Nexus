import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "../../../../lib/validators/auth.validators";
import { resetForcedPassword } from "../../../../services/auth.service";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/reset-password
 * Handles forced password reset for new accounts on first login.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod Validation
    const validatedData = resetPasswordSchema.parse(body);
    const { userId, currentPassword, newPassword } = validatedData;

    await resetForcedPassword(userId, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully."
    });
  } catch (error) {
    return handleApiError(error);
  }
}

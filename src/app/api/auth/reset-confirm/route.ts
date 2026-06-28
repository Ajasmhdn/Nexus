import { NextRequest, NextResponse } from "next/server";
import { resetConfirmSchema } from "../../../../lib/validators/auth.validators";
import { confirmForgotPassword } from "../../../../services/auth.service";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/reset-confirm
 * Completes password reset by verifying hashed token and applying the new password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod Validation
    const validatedData = resetConfirmSchema.parse(body);
    const { token, newPassword } = validatedData;

    await confirmForgotPassword(token, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password reset completed successfully. Please sign in with your new password."
    });
  } catch (error) {
    return handleApiError(error);
  }
}

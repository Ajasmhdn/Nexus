import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSchema } from "../../../../lib/validators/auth.validators";
import { verifyOtp } from "../../../../services/auth.service";
import { signResetToken, setResetCookie } from "../../../../lib/auth/jwt";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/verify-otp
 * Verifies OTP submitted by user. Sets a short-lived reset token cookie if successful.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod validation
    const validatedData = verifyOtpSchema.parse(body);
    const { email, otp } = validatedData;

    // Verify OTP using auth service
    const userId = await verifyOtp(email, otp);

    // Generate short-lived reset JWT (5 min)
    const resetToken = await signResetToken({ userId, purpose: "password_reset" });

    // Set HTTP-only reset cookie
    await setResetCookie(resetToken);

    return NextResponse.json({
      success: true,
      verified: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}

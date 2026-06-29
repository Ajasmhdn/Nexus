import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "../../../../lib/validators/auth.validators";
import { rateLimitForgotPassword } from "../../../../lib/auth/rate-limit";
import { requestForgotPassword } from "../../../../services/auth.service";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/forgot-password
 * Handles request for forgot password OTP-based flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod validation
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Enforce rate limiting on email
    await rateLimitForgotPassword(email);

    // Call service to generate OTP, store in DB, and trigger SMTP delivery
    await requestForgotPassword(email);

    return NextResponse.json({
      success: true,
      message: "OTP sent"
    });
  } catch (error) {
    return handleApiError(error);
  }
}

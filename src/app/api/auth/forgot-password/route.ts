import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "../../../../lib/validators/auth.validators";
import { rateLimitForgotPassword } from "../../../../lib/auth/rate-limit";
import { requestForgotPassword } from "../../../../services/auth.service";
import { sendPasswordResetEmail } from "../../../../lib/email";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/forgot-password
 * Handles forgot password request. Limits requests, creates tokens, and writes reset link to standard out.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod validation
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Enforce rate limiting on email
    await rateLimitForgotPassword(email);

    // Request token generation
    const rawToken = await requestForgotPassword(email);

    if (rawToken) {
      const origin = request.nextUrl.origin || "http://localhost:3000";
      const resetLink = `${origin}/auth?reset=${rawToken}`;
      await sendPasswordResetEmail(email, resetLink);
    }

    // Fail silently (returns success response) to prevent email harvesting/enumeration
    return NextResponse.json({
      success: true,
      message: "If a matching account exists, a password reset link has been generated."
    });
  } catch (error) {
    return handleApiError(error);
  }
}

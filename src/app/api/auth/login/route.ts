import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "../../../../lib/validators/auth.validators";
import { rateLimitLogin } from "../../../../lib/auth/rate-limit";
import { signInUser } from "../../../../services/auth.service";
import { signToken, setAuthCookie } from "../../../../lib/auth/jwt";
import { handleApiError } from "../../../../lib/errors";

/**
 * API Route: POST /api/auth/login
 * Authenticates users and issues secure session cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Zod Input Validation
    const validatedData = loginSchema.parse(body);
    const { userId, email, password } = validatedData;

    // 2. Enforce Rate Limiter Throttle
    await rateLimitLogin(userId);

    // 3. Authenticate User
    const result = await signInUser(userId, email, password);

    // If forced password reset flag is active, return flag and role without setting cookie
    if (result.requiresReset) {
      return NextResponse.json({
        requiresReset: true,
        role: result.role
      });
    }

    // 4. Generate Session Token and Set Cookie
    if (!result.user) {
      throw new Error("Internal Server Error: Authenticated user profile was empty.");
    }

    const tokenPayload = {
      userId: result.user.userId,
      email: result.user.email,
      role: result.role
    };

    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      requiresReset: false,
      role: result.role
    });
  } catch (error) {
    return handleApiError(error);
  }
}

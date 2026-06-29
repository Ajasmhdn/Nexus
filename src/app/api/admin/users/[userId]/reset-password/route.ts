import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../../lib/auth/get-current-user";
import { handleApiError, AppError } from "../../../../../../lib/errors";
import { adminResetPassword } from "../../../../../../services/admin.service";
import { adminResetPasswordSchema } from "../../../../../../lib/validators/admin.validators";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * POST /api/admin/users/[userId]/reset-password
 * Resets password of a target user. Restricted to Admins.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new AppError("Forbidden. Administrator access required.", 403, "FORBIDDEN");
    }

    const { userId } = await context.params;
    const body = await request.json();
    const validated = adminResetPasswordSchema.parse(body);

    const result = await adminResetPassword(userId, validated.newPassword, currentUser.userId);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

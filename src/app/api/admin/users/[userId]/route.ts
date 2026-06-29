import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth/get-current-user";
import { handleApiError, AppError } from "../../../../../lib/errors";
import { updateUser, toggleUserStatus } from "../../../../../services/admin.service";
import { updateUserSchema } from "../../../../../lib/validators/admin.validators";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * PUT /api/admin/users/[userId]
 * Updates user details. Restricted to Admins.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new AppError("Forbidden. Administrator access required.", 403, "FORBIDDEN");
    }

    const { userId } = await context.params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const user = await updateUser(userId, validated, currentUser.userId);

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Deactivates user (soft delete). Restricted to Admins.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new AppError("Forbidden. Administrator access required.", 403, "FORBIDDEN");
    }

    const { userId } = await context.params;
    if (userId === currentUser.userId) {
      throw new AppError("You cannot deactivate your own admin account.", 400, "SELF_DEACTIVATION_BLOCKED");
    }

    await toggleUserStatus(userId, currentUser.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

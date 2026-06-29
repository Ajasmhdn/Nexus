import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth/get-current-user";
import { handleApiError, AppError } from "../../../../lib/errors";
import { listUsers, createUser } from "../../../../services/admin.service";
import { listUsersSchema, createUserSchema } from "../../../../lib/validators/admin.validators";

/**
 * GET /api/admin/users
 * Lists users with optional pagination and search filters. Restricted to Admins.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new AppError("Forbidden. Administrator access required.", 403, "FORBIDDEN");
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    // Parse values using listUsersSchema
    const validated = listUsersSchema.parse({
      search,
      page: page !== null ? page : undefined,
      limit: limit !== null ? limit : undefined
    });

    const result = await listUsers(validated.search, validated.page, validated.limit);

    return NextResponse.json({
      users: result.users,
      total: result.total,
      page: validated.page,
      limit: validated.limit
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/users
 * Creates a new user. Restricted to Admins.
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new AppError("Forbidden. Administrator access required.", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const user = await createUser(validated, currentUser.userId);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

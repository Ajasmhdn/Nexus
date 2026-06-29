import { db } from "../lib/db/app-pool";
import { users, auditLogs } from "../lib/db/schema/app.schema";
import { hashPassword } from "../lib/auth/password";
import { AppError } from "../lib/errors";
import { eq, or, like, sql } from "drizzle-orm";
import { UserDTO } from "../types";

export interface ListUsersResult {
  users: UserDTO[];
  total: number;
}

/**
 * Lists all users with pagination and search filtering.
 */
export async function listUsers(search?: string, page: number = 1, limit: number = 20): Promise<ListUsersResult> {
  const offset = (page - 1) * limit;

  // Build where clause
  let whereClause = undefined;
  if (search) {
    whereClause = or(
      like(users.userId, `%${search}%`),
      like(users.email, `%${search}%`),
      like(users.fullName, `%${search}%`)
    );
  }

  // Get total count
  const [countRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(whereClause);
  const total = countRes?.count || 0;

  // Get users paginated, excluding passwordHash
  const results = await db
    .select({
      userId: users.userId,
      email: users.email,
      fullName: users.fullName,
      jobTitle: users.jobTitle,
      role: users.role,
      isActive: users.isActive,
      forcePasswordReset: users.forcePasswordReset,
      lastLoginAt: users.lastLoginAt,
      createdBy: users.createdBy,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  // Map database types to UserDTO (converting Date/Timestamp objects to string ISO strings)
  const usersDto: UserDTO[] = results.map(u => ({
    userId: u.userId,
    email: u.email,
    fullName: u.fullName,
    jobTitle: u.jobTitle,
    role: u.role as "admin" | "user",
    isActive: u.isActive,
    forcePasswordReset: u.forcePasswordReset,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdBy: u.createdBy,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString()
  }));

  return {
    users: usersDto,
    total
  };
}

/**
 * Creates a new user in the system with transaction-enforced audit logs.
 */
export async function createUser(data: any, createdBy: string): Promise<UserDTO> {
  // Check if user already exists
  const [existingUserById] = await db
    .select()
    .from(users)
    .where(eq(users.userId, data.userId));
  if (existingUserById) {
    throw new AppError("User ID already exists.", 409, "USER_ALREADY_EXISTS");
  }

  const [existingUserByEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));
  if (existingUserByEmail) {
    throw new AppError("Email already exists.", 409, "EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // db.transaction
  const createdUser = await db.transaction(async (tx) => {
    // Insert into users
    await tx.insert(users).values({
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      jobTitle: data.jobTitle,
      passwordHash,
      role: data.role,
      createdBy: createdBy,
      forcePasswordReset: true
    });

    // Get the created user back
    const [u] = await tx
      .select()
      .from(users)
      .where(eq(users.userId, data.userId));

    // Insert audit log
    await tx.insert(auditLogs).values({
      userId: createdBy,
      action: "USER_CREATED",
      entityType: "user",
      entityId: data.userId,
      description: `User '${data.userId}' created by administrator '${createdBy}'.`
    });

    return u;
  });

  return {
    userId: createdUser.userId,
    email: createdUser.email,
    fullName: createdUser.fullName,
    jobTitle: createdUser.jobTitle,
    role: createdUser.role as "admin" | "user",
    isActive: createdUser.isActive,
    forcePasswordReset: createdUser.forcePasswordReset,
    lastLoginAt: createdUser.lastLoginAt ? createdUser.lastLoginAt.toISOString() : null,
    createdBy: createdUser.createdBy,
    createdAt: createdUser.createdAt.toISOString(),
    updatedAt: createdUser.updatedAt.toISOString()
  };
}

/**
 * Updates an existing user's profile details.
 */
export async function updateUser(userId: string, data: any, updatedBy: string): Promise<UserDTO> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId));
  if (!existingUser) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  // If email is being changed, check unique email constraint
  if (data.email && data.email !== existingUser.email) {
    const [existingEmailUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (existingEmailUser) {
      throw new AppError("Email already exists.", 409, "EMAIL_ALREADY_EXISTS");
    }
  }

  const updatedUser = await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        fullName: data.fullName !== undefined ? data.fullName : undefined,
        jobTitle: data.jobTitle !== undefined ? data.jobTitle : undefined,
        role: data.role !== undefined ? data.role : undefined,
        email: data.email !== undefined ? data.email : undefined,
        updatedAt: new Date()
      })
      .where(eq(users.userId, userId));

    const [u] = await tx
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    // Audit log
    await tx.insert(auditLogs).values({
      userId: updatedBy,
      action: "USER_UPDATED",
      entityType: "user",
      entityId: userId,
      description: `User details updated for '${userId}' by '${updatedBy}'.`
    });

    return u;
  });

  return {
    userId: updatedUser.userId,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    jobTitle: updatedUser.jobTitle,
    role: updatedUser.role as "admin" | "user",
    isActive: updatedUser.isActive,
    forcePasswordReset: updatedUser.forcePasswordReset,
    lastLoginAt: updatedUser.lastLoginAt ? updatedUser.lastLoginAt.toISOString() : null,
    createdBy: updatedUser.createdBy,
    createdAt: updatedUser.createdAt.toISOString(),
    updatedAt: updatedUser.updatedAt.toISOString()
  };
}

/**
 * Toggles user active state (soft deactivation).
 */
export async function toggleUserStatus(userId: string, updatedBy: string): Promise<UserDTO> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId));
  if (!existingUser) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (userId === updatedBy) {
    throw new AppError("You cannot deactivate your own admin account.", 400, "SELF_DEACTIVATION_BLOCKED");
  }

  const nextStatus = !existingUser.isActive;

  const updatedUser = await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        isActive: nextStatus,
        updatedAt: new Date()
      })
      .where(eq(users.userId, userId));

    const [u] = await tx
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    // Audit log
    await tx.insert(auditLogs).values({
      userId: updatedBy,
      action: "USER_TOGGLED",
      entityType: "user",
      entityId: userId,
      description: `User account '${userId}' status set to ${nextStatus ? "active" : "inactive"} by '${updatedBy}'.`
    });

    return u;
  });

  return {
    userId: updatedUser.userId,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    jobTitle: updatedUser.jobTitle,
    role: updatedUser.role as "admin" | "user",
    isActive: updatedUser.isActive,
    forcePasswordReset: updatedUser.forcePasswordReset,
    lastLoginAt: updatedUser.lastLoginAt ? updatedUser.lastLoginAt.toISOString() : null,
    createdBy: updatedUser.createdBy,
    createdAt: updatedUser.createdAt.toISOString(),
    updatedAt: updatedUser.updatedAt.toISOString()
  };
}

/**
 * Resets a user's password and forces change password on next login.
 */
export async function adminResetPassword(userId: string, newPassword: string, resetBy: string): Promise<{ success: boolean }> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId));
  if (!existingUser) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash,
        forcePasswordReset: true,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.userId, userId));

    // Audit log
    await tx.insert(auditLogs).values({
      userId: resetBy,
      action: "PASSWORD_RESET_BY_ADMIN",
      entityType: "user",
      entityId: userId,
      description: `Password for user '${userId}' reset by administrator '${resetBy}'.`
    });
  });

  return { success: true };
}

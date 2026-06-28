import { db } from "../lib/db/app-pool";
import { JobTitle } from "../lib/constants";
import { users, passwordResetTokens, auditLogs } from "../lib/db/schema/app.schema";
import { comparePassword, hashPassword } from "../lib/auth/password";
import { AppError } from "../lib/errors";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export interface SignInResult {
  requiresReset: boolean;
  role: "admin" | "user";
  user?: {
    userId: string;
    email: string;
    fullName: string;
    jobTitle: JobTitle | null;
  };
}

/**
 * Handles credentials verification and updates user session audit trails.
 */
export async function signInUser(userId: string, email: string, password: string): Promise<SignInResult> {
  // Query users by userId and email
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.email, email)));

  // Check 1: User does not exist (unknown user)
  if (!user) {
    // Log as system event (NULL user_id) to avoid FK constraint violations
    await db.insert(auditLogs).values({
      userId: null, 
      action: "LOGIN_FAILED_NOT_FOUND",
      description: `Authentication failed: User with ID '${userId}' and email '${email}' not found.`
    });
    throw new AppError("Invalid User ID or email.", 401, "INVALID_CREDENTIALS");
  }

  // Check 2: Account is deactivated
  if (!user.isActive) {
    await db.insert(auditLogs).values({
      userId: user.userId,
      action: "LOGIN_FAILED_DISABLED",
      description: "Authentication failed: Attempted login on a deactivated account."
    });
    throw new AppError("Your account has been deactivated. Please contact your administrator.", 401, "ACCOUNT_DISABLED");
  }

  // Check 3: Verify password hash
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    await db.insert(auditLogs).values({
      userId: user.userId,
      action: "LOGIN_FAILED_PASSWORD",
      description: "Authentication failed: Password mismatch."
    });
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  // Check 4: Check if force reset flag is active
  if (user.forcePasswordReset) {
    return {
      requiresReset: true,
      role: user.role as "admin" | "user"
    };
  }

  // Success: Update last login timestamp and write success log
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.userId, user.userId));

  await db.insert(auditLogs).values({
    userId: user.userId,
    action: "LOGIN_SUCCESS",
    description: "User authenticated successfully."
  });

  return {
    requiresReset: false,
    role: user.role as "admin" | "user",
    user: {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      jobTitle: user.jobTitle as JobTitle | null
    }
  };
}

/**
 * Executes a forced password reset (first sign-in) flow.
 */
export async function resetForcedPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId));

  if (!user || !user.isActive) {
    throw new AppError("Invalid or inactive user ID.", 401, "USER_NOT_FOUND");
  }

  // Verify current password is correct
  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Current password incorrect.", 401, "PASSWORD_MISMATCH");
  }

  // Hash and save new password
  const newHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newHash,
      forcePasswordReset: false,
      passwordChangedAt: new Date()
    })
    .where(eq(users.userId, userId));

  await db.insert(auditLogs).values({
    userId,
    action: "FORCE_RESET_COMPLETED",
    description: "First-login forced password reset successfully completed."
  });
}

/**
 * Creates a hashed password reset token and returns the raw key.
 */
export async function requestForgotPassword(email: string): Promise<string | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  // If user does not exist, log it to the audit logs and fail silently to prevent email enumeration
  if (!user) {
    await db.insert(auditLogs).values({
      userId: null,
      action: "LOGIN_FAILED_NOT_FOUND",
      description: `Password reset request failed: Email '${email}' does not exist.`
    });
    return null;
  }

  // Generate secure token and token hash (SHA-256)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

  // Store hashed token
  await db.insert(passwordResetTokens).values({
    userId: user.userId,
    tokenHash,
    expiresAt
  });

  await db.insert(auditLogs).values({
    userId: user.userId,
    action: "PASSWORD_RESET_REQUESTED",
    description: "Password reset request initiated and token generated."
  });

  return rawToken;
}

/**
 * Verifies a reset token and updates the user's password inside a database transaction.
 * Checks expiration and logs expired audits OUTSIDE the transaction boundary to prevent rollback.
 */
export async function confirmForgotPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // 1. Fetch token record outside transaction
  const [tokenRecord] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash));

  if (!tokenRecord) {
    throw new AppError("Invalid or unrecognized password reset token.", 400, "INVALID_TOKEN");
  }

  // Check if token already used
  if (tokenRecord.usedAt) {
    throw new AppError("This password reset link has already been used.", 400, "TOKEN_ALREADY_USED");
  }

  // Check if token has expired
  if (new Date() > tokenRecord.expiresAt) {
    // Log expired audit outside the transaction to preserve it on error
    await db.insert(auditLogs).values({
      userId: tokenRecord.userId,
      action: "PASSWORD_RESET_EXPIRED",
      description: "Password reset confirm failed: Token expired."
    });
    throw new AppError("This password reset link has expired.", 400, "TOKEN_EXPIRED");
  }

  const newHash = await hashPassword(newPassword);

  // 2. Execute actual password updates atomically inside a transaction (Refinement #4)
  await db.transaction(async (tx) => {
    // Re-verify under transaction lock (checking same values)
    const [tokenRecordTx] = await tx
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash));

    if (!tokenRecordTx || tokenRecordTx.usedAt || new Date() > tokenRecordTx.expiresAt) {
      throw new Error("Lock check verification failed.");
    }

    // Update user's password
    await tx
      .update(users)
      .set({
        passwordHash: newHash,
        forcePasswordReset: false,
        passwordChangedAt: new Date()
      })
      .where(eq(users.userId, tokenRecordTx.userId));

    // Mark token as used
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.tokenId, tokenRecordTx.tokenId));

    // Log completion audit log inside transactional boundary
    await tx.insert(auditLogs).values({
      userId: tokenRecordTx.userId,
      action: "PASSWORD_RESET_COMPLETED",
      description: "Password reset confirmation successfully applied."
    });
  });
}

/**
 * Logs user logout event to the audit logs.
 */
export async function logLogout(userId: string): Promise<void> {
  await db.insert(auditLogs).values({
    userId,
    action: "LOGOUT",
    description: "User logged out explicitly."
  });
}

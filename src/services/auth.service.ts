import { db } from "../lib/db/app-pool";
import { JobTitle } from "../lib/constants";
import { users, passwordResetTokens, auditLogs } from "../lib/db/schema/app.schema";
import { comparePassword, hashPassword } from "../lib/auth/password";
import { AppError } from "../lib/errors";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { sendOtpEmail } from "../lib/email";

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

  const isSamePassword = await comparePassword(newPassword, user.passwordHash);
  if (isSamePassword) {
    throw new AppError("New password must be different from the current password.", 400, "PASSWORD_REUSE_BLOCKED");
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
 * Generates a 6-digit OTP, hashes it, and triggers the SMTP send operation.
 * Fails silently for email enumeration prevention but logs the event.
 */
export async function requestForgotPassword(email: string): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    await db.insert(auditLogs).values({
      userId: null,
      action: "LOGIN_FAILED_NOT_FOUND",
      description: `Password reset request failed: Email '${email}' does not exist.`
    });
    return;
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  // SHA-256 hash of OTP
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Insert token record (tokenHash set to null)
  await db.insert(passwordResetTokens).values({
    userId: user.userId,
    tokenHash: null,
    otpHash,
    expiresAt
  });

  // Trigger real SMTP send
  await sendOtpEmail(email, otp);

  await db.insert(auditLogs).values({
    userId: user.userId,
    action: "PASSWORD_RESET_REQUESTED",
    description: "Password reset request initiated and OTP generated."
  });
}

/**
 * Validates the OTP submitted by the user. If valid, marks it as used and returns the userId.
 */
export async function verifyOtp(email: string, otp: string): Promise<string> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    throw new AppError("Invalid or expired OTP.", 400, "INVALID_OTP");
  }

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  // Lookup active token record matching user_id, otp_hash, and non-expired, unused
  const [tokenRecord] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, user.userId),
        eq(passwordResetTokens.otpHash, otpHash)
      )
    );

  if (!tokenRecord) {
    throw new AppError("Invalid or expired OTP.", 400, "INVALID_OTP");
  }

  if (tokenRecord.usedAt) {
    throw new AppError("Invalid or expired OTP.", 400, "OTP_ALREADY_USED");
  }

  if (new Date() > tokenRecord.expiresAt) {
    throw new AppError("Invalid or expired OTP.", 400, "OTP_EXPIRED");
  }

  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.tokenId, tokenRecord.tokenId));

  return user.userId;
}

/**
 * Reset confirm updates user's password in a transaction.
 */
export async function confirmForgotPassword(userId: string, newPassword: string): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId));

  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive.", 401, "USER_NOT_FOUND");
  }

  const isSamePassword = await comparePassword(newPassword, user.passwordHash);
  if (isSamePassword) {
    throw new AppError("New password must be different from the current password.", 400, "PASSWORD_REUSE_BLOCKED");
  }

  const newHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    // Update user password and clear forced reset flag
    await tx
      .update(users)
      .set({
        passwordHash: newHash,
        forcePasswordReset: false,
        passwordChangedAt: new Date()
      })
      .where(eq(users.userId, userId));

    // Log completion
    await tx.insert(auditLogs).values({
      userId,
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

import { z } from "zod";
import { JOB_TITLES } from "../constants";

/**
 * Strong password policy validator.
 * Enforces:
 * - Minimum 8 characters.
 * - At least one lowercase letter.
 * - At least one uppercase letter.
 * - At least one numeric digit.
 */
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Validator for User Login body payload.
 */
export const loginSchema = z.object({
  userId: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/, "User ID must be alphanumeric or underscores only"),
  email: z.string().email("Invalid email address format"),
  password: z.string().min(1, "Password is required")
});

/**
 * Validator for Forced Password Reset body payload.
 */
export const resetPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp:   z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits')
});

export const resetConfirmSchema = z.object({
  newPassword: passwordSchema
});

/**
 * Validator for Admin User Creation (Step 5) body payload.
 * Restricts roles to strictly "admin" or "user".
 */
export const userCreateSchema = z.object({
  userId:   z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email:    z.string().email(),
  fullName: z.string().min(2).max(100),
  jobTitle: z.enum(JOB_TITLES),
  password: passwordSchema,
  role:     z.enum(['admin', 'user'])
});

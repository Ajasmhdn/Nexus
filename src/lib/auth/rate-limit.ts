import { appPool } from "../db/app-pool";
import { AppError } from "../errors";

// TODO Phase 7: Replace audit_logs scan with Redis or
// dedicated rate_limit_attempts table for performance at scale

/**
 * Throttles login attempts to prevent brute force attacks.
 * Limit: Max 5 LOGIN_FAILED_PASSWORD attempts per userId within 15 minutes.
 */
export async function rateLimitLogin(userId: string): Promise<void> {
  const [rows] = await appPool.query(`
    SELECT COUNT(*) as attempts
    FROM audit_logs
    WHERE user_id = ?
      AND action = 'LOGIN_FAILED_PASSWORD'
      AND created_at >= NOW() - INTERVAL 15 MINUTE
  `, [userId]) as [any[], any];

  const attempts = rows[0]?.attempts || 0;
  if (attempts >= 5) {
    throw new AppError("Too many failed login attempts. Please try again after 15 minutes.", 429, "RATE_LIMIT_EXCEEDED");
  }
}

/**
 * Throttles forgot password requests to prevent spam.
 * Limit: Max 3 PASSWORD_RESET_REQUESTED requests per email within 15 minutes.
 */
export async function rateLimitForgotPassword(email: string): Promise<void> {
  const [rows] = await appPool.query(`
    SELECT COUNT(*) as requests
    FROM audit_logs al
    JOIN users u ON al.user_id = u.user_id
    WHERE u.email = ?
      AND al.action = 'PASSWORD_RESET_REQUESTED'
      AND al.created_at >= NOW() - INTERVAL 15 MINUTE
  `, [email]) as [any[], any];

  const requests = rows[0]?.requests || 0;
  if (requests >= 3) {
    throw new AppError("Too many password reset requests. Please try again after 15 minutes.", 429, "RATE_LIMIT_EXCEEDED");
  }
}

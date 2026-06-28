/**
 * Application configuration flags and environment validation.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/**
 * Validates that all required environment variables are present and secure when not in mock mode.
 * Logs critical errors and throws in production environments.
 */
export function validateEnv() {
  if (USE_MOCK) {
    return;
  }

  const requiredEnvVars = [
    "APP_DB_HOST",
    "APP_DB_PORT",
    "APP_DB_USER",
    "APP_DB_PASSWORD",
    "APP_DB_NAME",
    "OPS_DB_HOST",
    "OPS_DB_PORT",
    "OPS_DB_USER",
    "OPS_DB_PASSWORD",
    "OPS_DB_NAME",
    "JWT_SECRET",
    "GEMINI_API_KEY",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `Missing critical environment variables: ${missing.join(", ")}`;
    console.error(`[CRITICAL] ${errorMsg}`);
    
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
  }

  // Security check: JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 64 || jwtSecret === "REPLACE_WITH_64_CHAR_RANDOM_HEX_DO_NOT_USE_DEFAULT") {
    const errorMsg = "JWT_SECRET must be at least 64 characters long and cannot be default placeholder";
    console.error(`[CRITICAL] ${errorMsg}`);
    if (process.env.NODE_ENV === "production" || !jwtSecret || jwtSecret.length < 64) {
      throw new Error(errorMsg);
    }
  }
}

import * as jose from "jose";

export interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "user";
  sessionId?: string;
}

/**
 * Asserts that JWT_SECRET is set and is at least 64 characters long.
 * Throws a critical startup error to prevent token signing with insecure defaults.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 64 || secret === "REPLACE_WITH_64_CHAR_RANDOM_HEX_DO_NOT_USE_DEFAULT") {
    throw new Error("Critical Configuration Error: JWT_SECRET is not configured, too short, or is default placeholder.");
  }
  return secret;
}

/**
 * Verify a token and return its payload. Returns null if invalid or expired.
 * Edge-compatible (does not import node-specific modules or next/headers).
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

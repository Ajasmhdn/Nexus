import * as jose from "jose";
import { cookies } from "next/headers";
import { getJwtSecret, verifyToken, JWTPayload } from "./verify-token";

export { verifyToken };
export type { JWTPayload };

/**
 * Sign a payload into a JWT token using jose (Edge-compatible).
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(getJwtSecret());
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";
  
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Sets the httpOnly session cookie.
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 28800, // 8 hours (8 * 3600)
  });
}

/**
 * Clears the session cookie.
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

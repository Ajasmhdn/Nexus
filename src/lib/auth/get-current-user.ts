import { verifyToken, JWTPayload } from "./jwt";
import { cookies } from "next/headers";

/**
 * Server-side helper to retrieve the authenticated user session from the httpOnly cookies.
 * Returns the decoded JWTPayload or null if the session is absent, expired, or invalid.
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

import { NextResponse } from "next/server";
import logger from "./logger";

/**
 * Custom application error class to handle structured API responses.
 */
export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Catch-all handler for API route errors.
 * Formats errors cleanly and prevents internal database details or stack traces
 * from leaking to the frontend client in production.
 */
export function handleApiError(error: unknown) {
  // Log the complete error server-side
  logger.error({ err: error }, "API Route Error caught");

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle generic errors securely
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : error instanceof Error
      ? error.message
      : String(error);

  return NextResponse.json(
    {
      error: {
        message,
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    { status: 500 }
  );
}

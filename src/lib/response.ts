import { NextResponse } from 'next/server';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { AppError } from '@/utils/appError';
import { ZodError } from 'zod';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  stack?: string;
};

/**
 * Standard Success Response Helper
 */
export function success<T>(
  message: string,
  data?: T,
  statusCode = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      ...(data !== undefined ? { data } : {}),
    },
    { status: statusCode },
  );
}

/**
 * Standard Error Response Helper
 */
export function error(
  message: string,
  statusCode = 500,
  errors: unknown[] = [],
  stack?: string,
): NextResponse<ApiResponse> {
  const isProduction = env.NODE_ENV === 'production';
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      ...(!isProduction && stack ? { stack } : {}),
    },
    { status: statusCode },
  );
}

/**
 * Global API Error Handler utility for Route Handlers
 */
export function handleApiError(err: unknown): NextResponse<ApiResponse> {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err, `API Operational Error: ${err.message}`);
    } else {
      logger.warn(`API Client Error (${err.statusCode}): ${err.message}`);
    }
    return error(err.message, err.statusCode, err.errors, err.stack);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn({ errors: formattedErrors }, 'API Zod Validation Failure');
    return error('Validation failed', 400, formattedErrors);
  }

  // Fallback for unexpected errors
  const standardError = err instanceof Error ? err : new Error(String(err));
  logger.error(standardError, 'API Unhandled Exception');

  return error(
    'Internal Server Error',
    500,
    [],
    standardError.stack,
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { AppError } from '@/utils/appError';
import { ZodError } from 'zod';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: string;
    details: string;
  };
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
  errorDetails?: { type: string; details: string },
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: errorDetails || {
        type: 'INTERNAL_ERROR',
        details: message,
      },
    },
    { status: statusCode },
  );
}

/**
 * Global API Error Handler utility for Route Handlers
 */
export function handleApiError(err: unknown, req?: NextRequest): NextResponse<ApiResponse> {
  const method = req?.method || 'UNKNOWN';
  const path = req?.nextUrl?.pathname || 'UNKNOWN';
  const timestamp = new Date().toISOString();
  
  const standardError = err instanceof Error ? err : new Error(String(err));
  const stack = standardError.stack || 'No stack trace';
  const message = standardError.message;

  // Log error on backend with required fields
  logger.error({
    method,
    path,
    timestamp,
    message,
    stack,
  }, `API Error: [${method}] ${path} - ${message}`);

  const isProduction = env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    let errorType = 'INTERNAL_ERROR';
    if (err.statusCode === 400) errorType = 'BAD_REQUEST';
    else if (err.statusCode === 404) errorType = 'NOT_FOUND';
    
    return error(err.message, err.statusCode, {
      type: errorType,
      details: isProduction ? err.message : `${err.message}\nStack: ${stack}`,
    });
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return error('Validation failed', 400, {
      type: 'VALIDATION_ERROR',
      details,
    });
  }

  return error(
    'Internal Server Error',
    500,
    {
      type: 'INTERNAL_ERROR',
      details: isProduction ? standardError.message : `${standardError.message}\nStack: ${stack}`,
    }
  );
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: unknown[];

  constructor(
    message: string,
    statusCode = 500,
    errors: unknown[] = [],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, errors: unknown[] = []): AppError {
    return new AppError(message, 400, errors);
  }

  public static unauthorized(message: string): AppError {
    return new AppError(message, 401);
  }

  public static forbidden(message: string): AppError {
    return new AppError(message, 403);
  }

  public static notFound(message: string): AppError {
    return new AppError(message, 404);
  }

  public static internal(message: string, errors: unknown[] = []): AppError {
    return new AppError(message, 500, errors);
  }
}

export default AppError;

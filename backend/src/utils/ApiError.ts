export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string>[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: Record<string, string>[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: Record<string, string>[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message = 'Unauthorized access'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static validationError(message: string, errors?: Record<string, string>[]): ApiError {
    return new ApiError(422, message, true, errors);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}

export default ApiError;

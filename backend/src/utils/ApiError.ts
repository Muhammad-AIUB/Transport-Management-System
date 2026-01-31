/**
 * Custom API Error class for consistent error handling
 * Extends built-in Error with HTTP status codes and operational flag
 */
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
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Factory method for 400 Bad Request
   */
  static badRequest(message: string, errors?: Record<string, string>[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  /**
   * Factory method for 401 Unauthorized
   */
  static unauthorized(message = 'Unauthorized access'): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Factory method for 403 Forbidden
   */
  static forbidden(message = 'Access forbidden'): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Factory method for 404 Not Found
   */
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Factory method for 409 Conflict
   */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Factory method for 422 Unprocessable Entity (validation errors)
   */
  static validationError(message: string, errors?: Record<string, string>[]): ApiError {
    return new ApiError(422, message, true, errors);
  }

  /**
   * Factory method for 500 Internal Server Error
   */
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}

export default ApiError;

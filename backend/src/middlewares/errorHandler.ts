import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

interface PrismaError extends Error {
  code: string;
  meta?: {
    target?: string[];
  };
}

const errorHandler = (
  err: Error | ApiError | PrismaError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if ('code' in err && typeof err.code === 'string' && err.code.startsWith('P')) {
    // Prisma error handling
    error = handlePrismaError(err as PrismaError);
  } else if (err.name === "ZodError") {
    error = handleZodError(err as any);
  } else {
    const statusCode = (err as any).statusCode || 500;
    const message = err.message || "Internal Server Error";
    error = new ApiError(statusCode, message, false);
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

function handlePrismaError(error: PrismaError): ApiError {
  switch (error.code) {
    case "P2002":
      const field = error.meta?.target?.join(", ") || "field";
      return new ApiError(409, `${field} already exists`);

    case "P2003":
      return new ApiError(400, "Referenced record does not exist");

    case "P2025":
      return new ApiError(404, "Record not found");

    case "P2014":
      return new ApiError(400, "Invalid relation data");

    default:
      return new ApiError(500, "Database error occurred");
  }
}

function handleZodError(error: { errors: Array<{ path: string[]; message: string }> }): ApiError {
  const errors = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return new ApiError(400, "Validation failed", true, errors);
}

export default errorHandler;

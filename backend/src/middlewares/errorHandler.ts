import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { Prisma } from "@prisma/client";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaError(error);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      error = new ApiError(400, "Validation Error: Invalid data provided");
    } else if (error.name === "ZodError") {
      error = handleZodError(error);
    } else {
      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal Server Error";
      error = new ApiError(statusCode, message, false);
    }
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

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): ApiError {
  switch (error.code) {
    case "P2002":
      const field = (error.meta?.target as string[])?.join(", ") || "field";
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

function handleZodError(error: any): ApiError {
  const errors = error.errors.map((err: any) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return new ApiError(400, "Validation failed", true, errors);
}

export default errorHandler;

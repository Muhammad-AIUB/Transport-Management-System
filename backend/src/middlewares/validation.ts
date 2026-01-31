import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import ApiError from '../utils/ApiError';
const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: String(err.path?.join('.') || 'unknown'),
          message: String(err.message || 'Validation error'),
        }));
        next(new ApiError(400, 'Validation failed', true, errors));
      } else {
        next(error);
      }
    }
  };
};
export default validate;
import { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../errors/app-error';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas | ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Support both legacy single schema and new multi-schema format
    const schemaMap: ValidationSchemas = schemas instanceof Object && 'parse' in schemas ? { body: schemas as ZodSchema } : (schemas as ValidationSchemas);

    // Validate body
    if (schemaMap.body) {
      const result = schemaMap.body.safeParse(req.body);
      if (!result.success) {
        return next(
          new AppError(400, 'Validation Error', result.error.flatten())
        );
      }
      req.body = result.data;
    }

    // Validate query
    if (schemaMap.query) {
      const result = schemaMap.query.safeParse(req.query);
      if (!result.success) {
        return next(
          new AppError(400, 'Validation Error', result.error.flatten())
        );
      }
      req.query = result.data as typeof req.query;
    }

    // Validate params
    if (schemaMap.params) {
      const result = schemaMap.params.safeParse(req.params);
      if (!result.success) {
        return next(
          new AppError(400, 'Validation Error', result.error.flatten())
        );
      }
      req.params = result.data as typeof req.params;
    }

    next();
  };
}

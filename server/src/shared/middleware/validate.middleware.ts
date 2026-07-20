import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const flattened = result.error.flatten();
      const details = [
        ...Object.entries(flattened.fieldErrors).flatMap(([field, errors]) =>
          (errors || []).map((e) => `${field}: ${e}`)
        ),
        ...(flattened.formErrors || []),
      ];
      console.error('Validation Error Details:', details);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details,
        },
      });
      return;
    }
    res.locals.validatedData = result.data;
    if (source !== 'query') {
      req[source] = result.data;
    }
    next();
  };
}

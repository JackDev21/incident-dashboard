import { Request, Response, NextFunction } from "express"
import { z } from "zod"

/**
 * Middleware genérico para validar el cuerpo de una petición usando un esquema de Zod.
 */
export const validateBody = (schema: z.ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware genérico para validar los parámetros de consulta (query string) usando un esquema de Zod.
 */
export const validateQuery =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query)
      ;(req as Request & { validatedQuery?: z.infer<T> }).validatedQuery = parsed
      next()
    } catch (error) {
      next(error)
    }
  }

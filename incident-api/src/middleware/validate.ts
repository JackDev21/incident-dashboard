import { Request, Response, NextFunction } from "express"
import { ZodSchema } from "zod"

/**
 * Middleware genérico para validar el cuerpo de una petición usando un esquema de Zod.
 */
export const validateBody = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
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
export const validateQuery = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.query = schema.parse(req.query) as any as any
    next()
  } catch (error) {
    next(error)
  }
}

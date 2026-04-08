declare namespace Express {
  interface Request {
    /**
     * Propiedad añadida por middleware `validateQuery`.
     * Contiene el resultado parseado por Zod de `req.query`.
     */
    validatedQuery?: unknown
  }
}

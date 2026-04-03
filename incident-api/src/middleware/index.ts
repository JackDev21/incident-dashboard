import type { Request, Response, NextFunction } from "express"

export { createAppError, errorHandler, validateRequest, asyncHandler } from "./errorHandler"

export const requestLogger = (_req: Request, _res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${_req.method} ${_req.path}`)
  next()
}

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  })
}

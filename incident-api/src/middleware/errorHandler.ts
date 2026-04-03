import type { Request, Response, NextFunction } from "express"
import { sendError } from "../utils/responses"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown,
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (err: Error | AppError, _req: Request, res: Response, _next: NextFunction): void => {
  console.error("Error:", err)

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details)
    return
  }

  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, "Invalid JSON in request body", 400)
    return
  }

  sendError(res, err.message || "Internal server error", 500)
}

export const validateRequest =
  (validator: (data: unknown) => unknown) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = validator(req.body)
      next()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Validation error"
      throw new AppError(400, message)
    }
  }

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

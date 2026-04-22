import type { Request, Response, NextFunction } from "express"
import { sendError } from "../../utils/responses"
import { z } from "zod"

export interface AppError extends Error {
  statusCode: number
  details?: unknown
}

export const createAppError = (statusCode: number, message: string, details?: unknown): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.details = details
  Error.captureStackTrace(error, createAppError)
  return error
}

const isAppError = (error: unknown): error is AppError => {
  return error instanceof Error && "statusCode" in error
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  console.error("Error:", err)

  if (isAppError(err)) {
    sendError(res, err.message, err.statusCode, err.details)
    return
  }

  if (err instanceof z.ZodError) {
    const details = err.issues.map((e: any) => ({
      path: e.path.join("."),
      message: e.message,
    }))
    sendError(res, "Validation error", 400, details)
    return
  }

  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, "Invalid JSON in request body", 400)
    return
  }

  if (err instanceof Error) {
    sendError(res, err.message || "Internal server error", 500)
    return
  }

  sendError(res, "Internal server error", 500)
}

export const validateRequest =
  (validator: (data: unknown) => unknown) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = validator(req.body)
      next()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Validation error"
      throw createAppError(400, message)
    }
  }

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

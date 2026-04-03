import type { Response } from "express"
import type { ApiResponse, PaginatedResponse } from "../types/common.types"

export const sendSuccess = <T>(res: Response, data: T, message = "Success", statusCode = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  res.status(statusCode).json(response)
}

export const sendError = (res: Response, message: string, statusCode = 500, details?: unknown): void => {
  const response: ApiResponse = {
    success: false,
    error: message,
  }
  if (details) {
    response.details = details
  }
  res.status(statusCode).json(response)
}

export const sendPaginatedResponse = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
  statusCode = 200,
): void => {
  const response: PaginatedResponse<T> = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
  res.status(statusCode).json(response)
}

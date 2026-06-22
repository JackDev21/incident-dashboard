import type { Request, Response } from "express"
import { sendSuccess } from "../../../utils/responses"

import { chatService } from ".."
import { createAppError } from "../../../middleware/http/errorHandler"

export const messageChat = async (req: Request, res: Response): Promise<void> => {
  const question = String(req.body?.question ?? "").trim()
  if (!question) {
    throw createAppError(400, "Question is required")
  }

  const history: Array<{ role: "user" | "assistant"; content: string }> = Array.isArray(req.body?.history)
    ? req.body.history
    : []

  const selection = req.body?.selection
  const chatFilters = req.body?.chatFilters ?? null

  const { answer, appliedFilters } = await chatService.answerQuestion(
    question,
    history,
    req.user?.id,
    selection,
    chatFilters,
  )
  sendSuccess(res, { answer, appliedFilters }, "Answer generated successfully")
}

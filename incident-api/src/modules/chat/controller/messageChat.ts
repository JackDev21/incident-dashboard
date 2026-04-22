import type { Request, Response } from "express"
import { sendSuccess } from "../../../utils/responses"
import { createAppError } from "../../../middleware"
import { chatService } from ".."

export const messageChat = async (req: Request, res: Response): Promise<void> => {
  const question = String(req.body?.question ?? "").trim()
  if (!question) {
    throw createAppError(400, "Question is required")
  }

  const history: Array<{ role: "user" | "assistant"; content: string }> = Array.isArray(req.body?.history)
    ? req.body.history
    : []

  const { answer, appliedFilters } = await chatService.answerQuestion(question, history, req.user?.id)
  sendSuccess(res, { answer, appliedFilters }, "Answer generated successfully")
}

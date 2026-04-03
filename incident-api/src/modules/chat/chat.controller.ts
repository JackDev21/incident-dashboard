import type { Request, Response } from "express"
import { sendSuccess } from "../../utils/responses"
import { createAppError } from "../../middleware"
import * as chatService from "./chat.service"

export const messageChat = async (req: Request, res: Response): Promise<void> => {
  const question = String(req.body?.question ?? "").trim()
  if (!question) {
    throw createAppError(400, "Question is required")
  }

  const answer = await chatService.answerQuestion(question)
  sendSuccess(res, { answer }, "Answer generated successfully")
}

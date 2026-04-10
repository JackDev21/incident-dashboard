import { Router } from "express"
import { asyncHandler } from "../../middleware"
import { messageChat } from "./chat.controller"
import { validateBody } from "../../middleware/validate"
import { z } from "zod"

const router = Router()

const chatSchema = z.object({
  question: z.string().min(1, "Question is required").max(1000, "Question is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
})

router.post("/query", validateBody(chatSchema), asyncHandler(messageChat))

export default router

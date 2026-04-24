import { Router } from "express"

import { z } from "zod"

import { messageChat } from ".."
import { authMiddleware } from "../../../middleware/http/auth"
import { validateBody } from "../../../middleware/http/validate"
import { asyncHandler } from "../../../middleware/http/errorHandler"

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
  selection: z
    .object({
      field: z.string(),
      value: z.string(),
    })
    .optional(),
})

// Protect chat routes
router.use(authMiddleware)

router.post("/query", validateBody(chatSchema), asyncHandler(messageChat))

export default router

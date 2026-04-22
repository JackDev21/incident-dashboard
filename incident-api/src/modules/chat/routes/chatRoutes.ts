import { Router } from "express"

import { z } from "zod"
import { authMiddleware } from "../../../middleware/auth"
import { validateBody } from "../../../middleware/validate"
import { asyncHandler } from "../../../middleware"
import { messageChat } from ".."

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

// Protect chat routes
router.use(authMiddleware)

router.post("/query", validateBody(chatSchema), asyncHandler(messageChat))

export default router

import { Router } from "express"
import { asyncHandler } from "../../middleware"
import { messageChat } from "./chat.controller"

const router = Router()

router.post("/query", asyncHandler(messageChat))

export default router

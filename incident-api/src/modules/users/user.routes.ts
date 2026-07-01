import { Router } from "express"
import { userController } from "./user.controller"
import { RegisterUserSchema, LoginUserSchema } from "./dtos/user.dto"
import { validateBody } from "../../middleware/http/validate"
import { asyncHandler } from "../../middleware/http/errorHandler"

const router = Router()

router.post("/register", validateBody(RegisterUserSchema), asyncHandler(userController.register))
router.post("/login", validateBody(LoginUserSchema), asyncHandler(userController.login))

export default router

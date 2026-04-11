import { Request, Response } from "express"
import { UserService } from "./user.service"
import { RegisterUserSchema, LoginUserSchema } from "./dtos/user.dto"
import { ZodError } from "zod"

const userService = new UserService()

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = RegisterUserSchema.parse(req.body)
      const user = await userService.createUser(validatedData)

      const userResponse = { ...user }
      delete userResponse.password

      return res.status(201).json({
        message: "User registered successfully",
        user: userResponse,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.issues.map((i) => i.message).join(", "),
          errors: error.issues,
        })
      }
      return res.status(400).json({
        message: error.message || "Registration failed",
        errors: error.errors,
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = LoginUserSchema.parse(req.body)
      const { user, token } = await userService.authenticateUser(validatedData.email, validatedData.password)

      return res.status(200).json({
        message: "Login successful",
        user,
        token,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.issues.map((i) => i.message).join(", "),
          errors: error.issues,
        })
      }
      return res.status(401).json({
        message: error.message || "Invalid credentials",
      })
    }
  }
}

export const userController = new UserController()

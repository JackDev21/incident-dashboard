import { Request, Response } from "express"
import { UserService } from "./user.service"
import jwt from "jsonwebtoken"
import { getJwtSecret } from "../../config"
import type { LoginUserDTO, RegisterUserDTO } from "./dtos/user.dto"

const userService = new UserService()

export class UserController {
  register = async (req: Request, res: Response): Promise<void> => {
    const validatedData = req.body as RegisterUserDTO
    const user = await userService.createUser(validatedData)

    const userId = (user as any)._id || user.id
    const token = jwt.sign({ id: userId, email: user.email }, getJwtSecret(), { expiresIn: "24h" })

    const userResponse = { ...user }
    delete userResponse.password

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
    })
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const validatedData = req.body as LoginUserDTO

    const { user, token } = await userService.authenticateUser(validatedData.email, validatedData.password)
    res.status(200).json({
      message: "Login successful",
      user,
      token,
    })
  }
}

export const userController = new UserController()

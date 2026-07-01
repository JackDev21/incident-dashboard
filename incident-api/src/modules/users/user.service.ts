import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserModel } from "./user.model"
import { User } from "./user.types"
import { getJwtSecret } from "../../config"
import { createAppError } from "../../middleware/http/errorHandler"

export class UserService {
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const { password, ...otherData } = userData

    if (!password) {
      throw createAppError(400, "Password is required")
    }

    // 1. Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: otherData.email })
    if (existingUser) {
      throw createAppError(409, "A user with this email already exists")
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 3. Guardar en DB
    const userDoc = await UserModel.create({
      ...otherData,
      password: hashedPassword,
    })

    return userDoc.toObject()
  }

  async authenticateUser(email: string, pass: string): Promise<{ user: User; token: string }> {
    // 1. Buscar usuario
    const user = await UserModel.findOne({ email })
    if (!user || !user.password) {
      throw createAppError(401, "Invalid credentials")
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(pass, user.password)
    if (!isMatch) {
      throw createAppError(401, "Invalid credentials")
    }

    // 3. Generar Token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, getJwtSecret(), { expiresIn: "24h" })

    const userResponse = user.toObject()
    delete userResponse.password

    return {
      user: userResponse as User,
      token,
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).select("-password").lean()
    return user as User | null
  }
}

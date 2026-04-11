import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserModel } from "./user.model"
import { User } from "./user.types"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-portfolio-key"

export class UserService {
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const { password, ...otherData } = userData

    if (!password) {
      throw new Error('Password is required')
    }

    // 1. Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: otherData.email })
    if (existingUser) {
      throw new Error("A user with this email already exists")
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
      throw new Error("Invalid credentials")
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(pass, user.password)
    if (!isMatch) {
      throw new Error("Invalid credentials")
    }

    // 3. Generar Token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "24h" })

    const userResponse = user.toObject()
    delete userResponse.password

    return {
      user: userResponse as User,
      token,
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).select("-password").lean();
    return user as User | null;
  }
}

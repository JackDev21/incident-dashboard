import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { getJwtSecret } from "../../config"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const jwtSecret = getJwtSecret()

  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string }

    // Adjuntamos la información del usuario al objeto req
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

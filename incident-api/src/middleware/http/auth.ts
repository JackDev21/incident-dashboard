import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    console.error("CRITICAL: JWT_SECRET no definido en las variables de entorno")
    return res.status(500).json({ message: "Internal server error: Missing configuration" })
  }

  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }

    // Adjuntamos la información del usuario al objeto req
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

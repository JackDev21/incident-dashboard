import "dotenv/config"
import { createServer } from "http"
import express from "express"
import cors from "cors"
import { io } from "./socket"
import { incidentRoutes, chatRoutes, userRoutes } from "./modules"
import { requestLogger, notFound } from "./middleware"
import { connectDB } from "./config/db/connection"
import helmet from "helmet"
import { chatRateLimiter, globalRateLimiter } from "./middleware/http/security"
import { errorHandler } from "./middleware/http/errorHandler"
import { socketConnectionLimiter } from "./middleware/socket/socketSecurity"

const app = express()
app.set("trust proxy", 1)
const PORT = process.env.PORT ?? 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173"

app.use(helmet())
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())
app.use(globalRateLimiter)
app.use(requestLogger)

// Routes
app.use("/api/incidents", incidentRoutes)
app.use("/api/chat", chatRateLimiter, chatRoutes)
app.use("/api/users", userRoutes)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

const httpServer = createServer(app)

// Seguridad de WebSockets: Límite de conexiones por IP
io.use(socketConnectionLimiter)
io.attach(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})
;(async () => {
  try {
    await connectDB()
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err)
    process.exit(1)
  }
})()

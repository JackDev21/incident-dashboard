import "dotenv/config"
import { createServer } from "http"
import express from "express"
import cors from "cors"
import { helmet, globalRateLimiter, chatRateLimiter } from "./middleware/security"
import { socketConnectionLimiter } from "./middleware/socketSecurity"
import { io } from "./socket"
import { connectDB } from "./config/db"
import { incidentRoutes, chatRoutes } from "./modules"
import { errorHandler } from "./middleware/errorHandler"
import { requestLogger, notFound } from "./middleware"

const app = express()
app.set('trust proxy', 1)
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

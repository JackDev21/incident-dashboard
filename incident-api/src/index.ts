import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db"
import { incidentRoutes, chatRoutes } from "./modules"
import { errorHandler } from "./middleware/errorHandler"
import { requestLogger, notFound } from "./middleware"

const app = express()
const PORT = process.env.PORT ?? 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173"

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())
app.use(requestLogger)

// Routes
app.use("/api/incidents", incidentRoutes)
app.use("/api/chat", chatRoutes)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)
;(async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err)
    process.exit(1)
  }
})()

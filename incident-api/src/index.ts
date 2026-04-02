import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db"
import incidentRoutes from "./incidents/incident.routes"

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api/incidents", incidentRoutes)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err)
    process.exit(1)
  })

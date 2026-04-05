import "dotenv/config"
import mongoose from "mongoose"
import { IncidentModel } from "../modules/incidents/incident.model"

const STATUSES = ["open", "in progress", "resolved"] as const
const PRIORITIES = ["low", "medium", "high"] as const
const ASSIGNEES = ["Ana", "Carlos", "Jose", "Laura", "Miguel", "Sara", "David", "Elena"]

const TITLES = [
  "Login page returns 500 error",
  "Payment gateway timeout",
  "Dashboard charts not rendering",
  "Email notifications not sent",
  "Session expires too early",
  "CSV export produces empty file",
  "Search results pagination broken",
  "Profile picture upload fails",
  "2FA code not arriving",
  "Memory leak in background worker",
  "API rate limiter blocks valid requests",
  "Mobile layout broken on iOS 17",
  "Dark mode toggle not persisting",
  "Webhook signature validation fails",
  "Slow query on reports page",
  "403 error when editing own profile",
  "Duplicate entries in audit log",
  "Notification badge count wrong",
  "File preview crashes on PDF",
  "Date picker ignores timezone",
  "Cache not invalidated after update",
  "SSO redirect loop",
  "Missing translations in French locale",
  "Bulk delete button unresponsive",
  "Chart tooltip shows NaN values",
  "Avatar initials cut off",
  "Password reset link expired immediately",
  "Alert threshold not triggering",
  "Graph data off by one day",
  "Role permissions not applied on first login",
  "Markdown editor loses cursor position",
  "Auto-save silently discards changes",
  "Activity feed not loading older items",
  "Table sort order resets on refresh",
  "Sidebar collapses unexpectedly on desktop",
  "Tag input duplicates entries",
  "Dropdown closes on scroll",
  "Console errors on empty state",
  "API returns 200 on validation failure",
  "Long titles overflow card layout",
]

const DESCRIPTIONS = [
  "Intermittent issue reported by multiple users in production.",
  "Reproducible on Chrome and Firefox; Safari unaffected.",
  "Only occurs after a migration deployed last Monday.",
  "Affects accounts created before 2025-01-01.",
  "High-volume endpoint; degraded performance during peak hours.",
  "Error logged in Sentry with stack trace attached.",
  "Customer support ticket raised; needs urgent attention.",
  "First noticed after the latest dependency update.",
  "Related to the recent infrastructure change in region EU-WEST.",
  "Workaround available: refresh the page manually.",
  "Regression introduced in v2.4.1 release.",
  "Confirmed on staging environment as well.",
  "No data loss observed so far; monitoring continues.",
  "Requires coordination with the backend and frontend teams.",
  "Possible race condition under heavy load.",
]

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  return d
}

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env")
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log("✅ Connected to MongoDB")

  const existing = await IncidentModel.countDocuments()
  console.log(`ℹ️  Existing incidents: ${existing}`)

  const incidents = Array.from({ length: 100 }, (_, i) => ({
    title: `${randomItem(TITLES)} (#${i + 1})`,
    description: randomItem(DESCRIPTIONS),
    status: randomItem(STATUSES),
    priority: randomItem(PRIORITIES),
    assignee: randomItem(ASSIGNEES),
    createdAt: randomDate(90),
  }))

  await IncidentModel.insertMany(incidents)
  console.log("✅ 100 incidents inserted successfully")

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})

import type { Incident } from "@/features/incidents/types/incident.types"

export const incidentsMock: Incident[] = [
  {
    id: "1",
    title: "Login error",
    description: "Some users cannot access the application with their credentials.",
    status: "open",
    priority: "high",
    assignee: "Jose",
    createdAt: "2026-03-28",
  },
  {
    id: "2",
    title: "Visual issue in the dashboard",
    description: "Status badges become misaligned on small screens.",
    status: "in progress",
    priority: "medium",
    assignee: "Ana",
    createdAt: "2026-03-27",
  },
  {
    id: "3",
    title: "Duplicate notification",
    description: "Duplicate push notifications are sent when publishing content.",
    status: "resolved",
    priority: "low",
    assignee: "Carlos",
    createdAt: "2026-03-25",
  },
]

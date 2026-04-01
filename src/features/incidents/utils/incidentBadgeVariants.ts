import type { IncidentPriority, IncidentStatus } from "@/features/incidents/types/incident.types"

export const getStatusVariant = (status: IncidentStatus) => {
  switch (status) {
    case "open":
      return "danger"
    case "in_progress":
      return "warning"
    case "resolved":
      return "success"
    default:
      return "neutral"
  }
}

export const getPriorityVariant = (priority: IncidentPriority) => {
  switch (priority) {
    case "high":
      return "danger"
    case "medium":
      return "warning"
    case "low":
      return "success"
    default:
      return "neutral"
  }
}

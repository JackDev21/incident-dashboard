import { Badge } from "@/components/ui/Badge"
import type { Incident, IncidentPriority, IncidentStatus } from "@/features/incidents/types/incident.types"

type IncidentDetailProps = {
  incident: Incident
}

const getStatusVariant = (status: IncidentStatus) => {
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

const getPriorityVariant = (priority: IncidentPriority) => {
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

export const IncidentDetail = ({ incident }: IncidentDetailProps) => {
  return (
    <div>
      <h2>{incident.title}</h2>
      <p>{incident.description}</p>
      <Badge label={incident.status} variant={getStatusVariant(incident.status)} />
      <Badge label={incident.priority} variant={getPriorityVariant(incident.priority)} />
      <p>Assignee: {incident.assignee}</p>
      <p>Created at: {incident.createdAt}</p>
    </div>
  )
}

import { Badge } from "@/components/ui/Badge"
import type { Incident } from "@/features/incidents/types/incident.types"
import { getPriorityVariant, getStatusVariant } from "@/features/incidents/utils/incidentBadgeVariants"

type IncidentDetailProps = {
  incident: Incident
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

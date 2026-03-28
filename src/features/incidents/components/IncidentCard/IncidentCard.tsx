import { Card } from "../../../../components/ui/Card/Card"
import type { Incident } from "../../types/incident.types"

type IncidentCardProps = {
  incident: Incident
}

export const IncidentCard = ({ incident }: IncidentCardProps) => {
  return (
    <Card>
      <h3>{incident.title}</h3>
      <p>{incident.description}</p>

      <p>Status: {incident.status}</p>
      <p>Priority:{incident.priority}</p>
      <p>Assignee: {incident.assignee}</p>
    </Card>
  )
}

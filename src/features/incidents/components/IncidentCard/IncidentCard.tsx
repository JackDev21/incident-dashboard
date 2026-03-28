import { Card } from "@/components/ui/Card/Card"
import { Badge } from "@/components/ui/Badge/Badge"
import styles from "@/features/incidents/components/IncidentCard/IncidentCard.module.scss"

import type { Incident, IncidentPriority, IncidentStatus } from "@/features/incidents/types/incident.types"
type IncidentCardProps = {
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

export const IncidentCard = ({ incident }: IncidentCardProps) => {
  return (
    <Card>
      <div className={styles.header}>
        <h3>{incident.title}</h3>

        <div className={styles.badges}>
          <Badge label={incident.status} variant={getStatusVariant(incident.status)} />
          <Badge label={incident.priority} variant={getPriorityVariant(incident.priority)} />
        </div>
      </div>

      <p>{incident.description}</p>

      <p className={styles.assignee}>Assignee: {incident.assignee}</p>
    </Card>
  )
}

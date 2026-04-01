import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import styles from "@/features/incidents/components/IncidentCard/IncidentCard.module.scss"

import type { Incident } from "@/features/incidents/types/incident.types"
import { getPriorityVariant, getStatusVariant } from "@/features/incidents/utils/incidentBadgeVariants"
type IncidentCardProps = {
  incident: Incident
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

      <p className={styles.assignee}>Assigned to: {incident.assignee}</p>
    </Card>
  )
}

import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Trash2 } from "lucide-react"
import styles from "@/features/incidents/components/IncidentCard/IncidentCard.module.scss"

import type { Incident } from "@/features/incidents/types/incident.types"
import { getPriorityVariant, getStatusVariant } from "@/features/incidents/utils/incidentBadgeVariants"

type IncidentCardProps = {
  incident: Incident
  onDelete?: (id: string) => void
}

export const IncidentCard = ({ incident, onDelete }: IncidentCardProps) => {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Evita que el clic navegue al detalle
    if (window.confirm("Are you sure you want to delete this incident?")) {
      onDelete?.(incident.id)
    }
  }

  return (
    <Card>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h3>{incident.title}</h3>
          <div className={styles.badges}>
            <Badge label={incident.status} variant={getStatusVariant(incident.status)} />
            <Badge label={incident.priority} variant={getPriorityVariant(incident.priority)} />
          </div>
        </div>

        {onDelete && (
          <Button
            icon={<Trash2 size={18} />}
            variant="icon"
            onClick={handleDelete}
            title="Delete incident"
            className={styles.deleteButton}
          />
        )}
      </div>

      <p>{incident.description}</p>

      <p className={styles.assignee}>Assigned to: {incident.assignee}</p>
    </Card>
  )
}

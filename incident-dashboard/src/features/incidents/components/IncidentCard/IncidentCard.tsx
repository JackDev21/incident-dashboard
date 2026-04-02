import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ConfirmModal } from "@/components/ui/Modal"
import { Trash2 } from "lucide-react"
import styles from "@/features/incidents/components/IncidentCard/IncidentCard.module.scss"

import type { Incident } from "@/features/incidents/types/incident.types"
import { getPriorityVariant, getStatusVariant } from "@/features/incidents/utils/incidentBadgeVariants"

type IncidentCardProps = {
  incident: Incident
  onDelete?: (id: string) => void
}

export const IncidentCard = ({ incident, onDelete }: IncidentCardProps) => {
  const [showModal, setShowModal] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowModal(true)
  }

  const handleConfirm = () => {
    onDelete?.(incident.id)
    setShowModal(false)
  }

  const formattedDate = incident.createdAt
    ? new Date(incident.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Unknown date"

  const assigneeInitial = incident.assignee?.trim().charAt(0).toUpperCase() || "?"

  return (
    <Card className="card">
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.badges}>
            <Badge label={incident.status} variant={getStatusVariant(incident.status)} />
            <Badge label={incident.priority} variant={getPriorityVariant(incident.priority)} />
          </div>
          <h3>{incident.title}</h3>
        </div>

        {onDelete && (
          <Button
            icon={<Trash2 size={16} />}
            variant="icon"
            onClick={handleDeleteClick}
            title="Delete incident"
            className={styles.deleteButton}
          />
        )}
      </div>

      <p className={styles.description}>{incident.description}</p>

      <div className={styles.footer}>
        <span className={styles.assignee}>
          <span className={styles.avatar} aria-hidden="true">
            {assigneeInitial}
          </span>
          <span>{incident.assignee}</span>
        </span>
        <span className={styles.date}>{formattedDate}</span>
      </div>

      {showModal && (
        <ConfirmModal
          title="Delete incident"
          description={`"${incident.title}" will be permanently deleted. This action cannot be undone.`}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </Card>
  )
}

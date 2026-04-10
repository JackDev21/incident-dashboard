import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ConfirmModal } from "@/components/ui/Modal"
import { Trash2 } from "lucide-react"
import styles from "@/features/incidents/components/IncidentCard/IncidentCard.module.scss"

import type { Incident } from "@/features/incidents/types/incident.types"
import { getPriorityVariant, getStatusVariant } from "@/features/incidents/utils/incidentBadgeVariants"

// Función para obtener las iniciales del nombre
const getUserInitials = (name: string): string => {
  if (!name || typeof name !== "string") return "?"
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

// Función para generar un color basado en el nombre
const getColorFromName = (name: string): string => {
  if (!name) return "#6b7280"
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]
  return colors[Math.abs(hash) % colors.length]
}

type IncidentCardProps = {
  incident: Incident
  onDelete?: (id: string) => void
}

export const IncidentCard = ({ incident, onDelete }: IncidentCardProps) => {
  const [showModal, setShowModal] = useState(false)
  const userInitials = getUserInitials(incident.assignee)
  const avatarColor = getColorFromName(incident.assignee)

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

  // Log the incident title on each render
  console.log("Incident rendered:", incident.title)

  const isResolved = incident.status === "resolved"

  return (
    <Card className={["card", isResolved ? styles.resolved : ""].join(" ").trim()}>
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
          <span className={styles.avatar} aria-hidden="true" style={{ backgroundColor: avatarColor, color: "white" }}>
            {userInitials}
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

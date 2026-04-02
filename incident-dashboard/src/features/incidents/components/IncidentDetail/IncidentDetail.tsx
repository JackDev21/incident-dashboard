import { Badge } from "@/components/ui/Badge"
import type { Incident, IncidentStatus } from "@/features/incidents/types/incident.types"
import { getPriorityVariant } from "@/features/incidents/utils/incidentBadgeVariants"
import styles from "./IncidentDetail.module.scss"

type IncidentDetailProps = {
  incident: Incident
  onStatusChange?: (status: IncidentStatus) => void
}

export const IncidentDetail = ({ incident, onStatusChange }: IncidentDetailProps) => {
  const formattedDate = incident.createdAt
    ? new Date(incident.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Unknown date"

  const assigneeInitial = incident.assignee?.trim().charAt(0).toUpperCase() || "?"

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <select
            className={styles.statusSelect}
            value={incident.status}
            onChange={(e) => onStatusChange?.(e.target.value as IncidentStatus)}
          >
            <option value="open">open</option>
            <option value="in progress">in progress</option>
            <option value="resolved">resolved</option>
          </select>
          <Badge label={incident.priority} variant={getPriorityVariant(incident.priority)} />
        </div>
        <h2 className={styles.title}>{incident.title}</h2>
      </div>

      <p className={styles.description}>{incident.description}</p>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Assignee</span>
          <span className={styles.metaValue}>
            <span className={styles.avatar} aria-hidden="true">
              {assigneeInitial}
            </span>
            {incident.assignee}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Created at</span>
          <span className={styles.metaValue}>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

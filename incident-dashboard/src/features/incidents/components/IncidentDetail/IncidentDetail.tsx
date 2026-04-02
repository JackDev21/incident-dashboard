import { Badge } from "@/components/ui/Badge"
import type { Incident } from "@/features/incidents/types/incident.types"
import { getPriorityVariant, getStatusVariant } from "@/features/incidents/utils/incidentBadgeVariants"
import styles from "./IncidentDetail.module.scss"

type IncidentDetailProps = {
  incident: Incident
}

export const IncidentDetail = ({ incident }: IncidentDetailProps) => {
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
          <Badge label={incident.status} variant={getStatusVariant(incident.status)} />
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

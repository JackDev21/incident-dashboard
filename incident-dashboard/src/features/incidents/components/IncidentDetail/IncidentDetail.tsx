import { Badge } from "@/components/ui/Badge"
import type { Incident, IncidentStatus } from "@/features/incidents/types/incident.types"
import { getPriorityVariant } from "@/features/incidents/utils/incidentBadgeVariants"
import { useTranslation } from "react-i18next"
import styles from "./IncidentDetail.module.scss"

type IncidentDetailProps = {
  incident: Incident
  onStatusChange?: (status: IncidentStatus) => void
}

export const IncidentDetail = ({ incident, onStatusChange }: IncidentDetailProps) => {
  const { t, i18n } = useTranslation()
  const formattedDate = incident.createdAt
    ? new Date(incident.createdAt).toLocaleDateString(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : t("common.unknownDate")

  const assigneeInitial = incident.assignee?.trim().charAt(0).toUpperCase() || "?"
  const creatorName =
    typeof incident.creatorId === "object" && incident.creatorId?.name
      ? incident.creatorId.name
      : null

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <select
            className={styles.statusSelect}
            value={incident.status}
            onChange={(e) => onStatusChange?.(e.target.value as IncidentStatus)}
          >
            <option value="open">{t("incidents.status.open")}</option>
            <option value="in progress">{t("incidents.status.inProgress")}</option>
            <option value="resolved">{t("incidents.status.resolved")}</option>
          </select>
          <Badge label={incident.priority} variant={getPriorityVariant(incident.priority)} />
        </div>
        <h2 className={styles.title}>{incident.title}</h2>
      </div>

      <p className={styles.description}>{incident.description}</p>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("incidents.detail.assignee")}</span>
          <span className={styles.metaValue}>
            <span className={styles.avatar} aria-hidden="true">
              {assigneeInitial}
            </span>
            {incident.assignee}
          </span>
        </div>
        {creatorName && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t("incidents.detail.reportedBy")}</span>
            <span className={styles.metaValue}>{creatorName}</span>
          </div>
        )}
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t("incidents.detail.createdAt")}</span>
          <span className={styles.metaValue}>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

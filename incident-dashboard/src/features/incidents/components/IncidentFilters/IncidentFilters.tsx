import type { IncidentPriority, IncidentStatus } from "@/features/incidents/types/incident.types"
import { useTranslation } from "react-i18next"
import styles from "./IncidentFilters.module.scss"

export type IncidentFiltersState = {
  status: IncidentStatus | ""
  priority: IncidentPriority | ""
  assignee: string
}

type IncidentFiltersProps = {
  filters: IncidentFiltersState
  assignees: string[]
  onChange: (filters: IncidentFiltersState) => void
  onReset: () => void
}

export const IncidentFilters = ({ filters, assignees, onChange, onReset }: IncidentFiltersProps) => {
  const { t } = useTranslation()
  const hasActiveFilters = filters.status !== "" || filters.priority !== "" || filters.assignee !== ""

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <select
          className={styles.select}
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as IncidentStatus | "" })}
          aria-label={t("incidents.filters.byStatus")}
        >
          <option value="">{t("incidents.filters.allStatuses")}</option>
          <option value="open">{t("incidents.status.open")}</option>
          <option value="in progress">{t("incidents.status.inProgress")}</option>
          <option value="resolved">{t("incidents.status.resolved")}</option>
        </select>

        <select
          className={styles.select}
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as IncidentPriority | "" })}
          aria-label={t("incidents.filters.byPriority")}
        >
          <option value="">{t("incidents.filters.allPriorities")}</option>
          <option value="high">{t("incidents.priority.high")}</option>
          <option value="medium">{t("incidents.priority.medium")}</option>
          <option value="low">{t("incidents.priority.low")}</option>
        </select>

        <select
          className={styles.select}
          value={filters.assignee}
          onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
          aria-label={t("incidents.filters.byAssignee")}
        >
          <option value="">{t("incidents.filters.allAssignees")}</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className={styles.resetButton} onClick={onReset}>
            {t("incidents.filters.clearFilters")}
          </button>
        )}
      </div>
    </div>
  )
}

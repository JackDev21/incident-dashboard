import type { IncidentPriority, IncidentStatus } from "@/features/incidents/types/incident.types"
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
  const hasActiveFilters = filters.status !== "" || filters.priority !== "" || filters.assignee !== ""

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <select
          className={styles.select}
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as IncidentStatus | "" })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          className={styles.select}
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as IncidentPriority | "" })}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className={styles.select}
          value={filters.assignee}
          onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
          aria-label="Filter by assignee"
        >
          <option value="">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className={styles.resetButton} onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

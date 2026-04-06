import { useState, useMemo } from "react"
import { IncidentCard } from "@/features/incidents/components/IncidentCard"
import { EmptyIncidentState } from "@/features/incidents/components/EmptyIncidentState"
import { IncidentFilters } from "@/features/incidents/components/IncidentFilters"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"
import { useIncidents } from "@/features/incidents/hooks/useIncidents"
import { useChatFilters } from "@/features/chat/context/useChatFilters"
import { Button } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import { useNavigate } from "react-router-dom"
import { Plus, MessageCircle } from "lucide-react"
import styles from "@/features/incidents/pages/IncidentListPage.module.scss"

const EMPTY_FILTERS: IncidentFiltersState = { status: "", priority: "", assignee: "" }

const normalizeAssigneeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim()

export const IncidentListPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [manualFilters, setManualFilters] = useState<IncidentFiltersState>(EMPTY_FILTERS)
  const { chatFilters, setChatFilters } = useChatFilters()

  const activeFilters = chatFilters ?? manualFilters

  const { incidents, assignees, pagination, loading, error, removeIncident } = useIncidents(page, activeFilters)

  const effectiveFilters = useMemo(() => {
    if (!activeFilters.assignee) return activeFilters
    const normalizedAssignee = normalizeAssigneeText(activeFilters.assignee)
    const matched = assignees.find((assignee) => normalizeAssigneeText(assignee) === normalizedAssignee)
    return { ...activeFilters, assignee: matched ?? activeFilters.assignee }
  }, [activeFilters, assignees])

  const handleFilterChange = (newFilters: IncidentFiltersState) => {
    setPage(1)
    setManualFilters(newFilters)
    setChatFilters(null)
  }

  const handleReset = () => {
    setPage(1)
    setManualFilters(EMPTY_FILTERS)
    setChatFilters(null)
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading incidents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error.message}</p>
        <Button label="Try again" onClick={() => window.location.reload()} variant="secondary" />
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Incidents</h1>
          <p className={styles.pageDescription}>Manage and track all system incidents.</p>
        </div>
        <Button label="New Incident" icon={<Plus size={18} />} onClick={() => navigate("/incidents/create")} />
      </div>

      <IncidentFilters
        filters={effectiveFilters}
        assignees={assignees}
        onChange={handleFilterChange}
        onReset={handleReset}
      />
      {chatFilters && (
        <div className={styles.chatFilterBanner}>
          <MessageCircle size={15} />
          <span>Filters applied from chat assistant</span>
          <button onClick={handleReset}>Clear</button>
        </div>
      )}

      {incidents.length === 0 ? (
        <EmptyIncidentState />
      ) : (
        <>
          <div className={styles.grid}>
            {incidents.map((incident) => (
              <div key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)} className={styles.listItem}>
                <IncidentCard incident={incident} onDelete={removeIncident} />
              </div>
            ))}
          </div>
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

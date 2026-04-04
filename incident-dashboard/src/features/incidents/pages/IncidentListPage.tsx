import { useState, useMemo, useEffect } from "react"
import { IncidentCard } from "@/features/incidents/components/IncidentCard"
import { EmptyIncidentState } from "@/features/incidents/components/EmptyIncidentState"
import { IncidentFilters } from "@/features/incidents/components/IncidentFilters"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"
import { useIncidents } from "@/features/incidents/hooks/useIncidents"
import { useChatFilters } from "@/features/chat/context/useChatFilters"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"
import { Plus, MessageCircle } from "lucide-react"
import styles from "@/features/incidents/pages/IncidentListPage.module.scss"

const EMPTY_FILTERS: IncidentFiltersState = { status: "", priority: "", assignee: "" }

export const IncidentListPage = () => {
  const { incidents, loading, error, removeIncident } = useIncidents()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<IncidentFiltersState>(EMPTY_FILTERS)
  const { chatFilters, setChatFilters } = useChatFilters()

  const assignees = useMemo(() => [...new Set(incidents.map((i) => i.assignee).filter(Boolean))].sort(), [incidents])

  useEffect(() => {
    if (!chatFilters) return
    // Normalize assignee: find exact match in real assignees list (case-insensitive)
    const normalizedAssignee = chatFilters.assignee
      ? (assignees.find((a) => a.toLowerCase().includes(chatFilters.assignee.toLowerCase())) ?? "")
      : ""
    setFilters({ ...chatFilters, assignee: normalizedAssignee })
  }, [chatFilters, assignees])

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setChatFilters(null)
  }

  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        if (filters.status && i.status !== filters.status) return false
        if (filters.priority && i.priority !== filters.priority) return false
        if (filters.assignee && i.assignee.toLowerCase() !== filters.assignee.toLowerCase()) return false
        return true
      }),
    [incidents, filters],
  )

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

      <IncidentFilters filters={filters} assignees={assignees} onChange={setFilters} onReset={handleReset} />

      {chatFilters && (
        <div className={styles.chatFilterBanner}>
          <MessageCircle size={15} />
          <span>Filters applied from chat assistant</span>
          <button onClick={handleReset}>Clear</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyIncidentState />
      ) : (
        <div className={styles.grid}>
          {filtered.map((incident) => (
            <div key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)} className={styles.listItem}>
              <IncidentCard incident={incident} onDelete={removeIncident} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

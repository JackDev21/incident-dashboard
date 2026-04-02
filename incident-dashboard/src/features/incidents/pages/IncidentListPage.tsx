import { IncidentCard } from "@/features/incidents/components/IncidentCard"
import { EmptyIncidentState } from "@/features/incidents/components/EmptyIncidentState"
import { useIncidents } from "@/features/incidents/hooks/useIncidents"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import styles from "@/features/incidents/pages/IncidentListPage.module.scss"

export const IncidentListPage = () => {
  const { incidents, loading, error, removeIncident } = useIncidents()
  const navigate = useNavigate()

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

      {incidents.length === 0 ? (
        <EmptyIncidentState />
      ) : (
        <div className={styles.grid}>
          {incidents.map((incident) => (
            <div key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)} className={styles.listItem}>
              <IncidentCard incident={incident} onDelete={removeIncident} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

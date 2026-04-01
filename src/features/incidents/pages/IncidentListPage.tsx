import { IncidentCard } from "@/features/incidents/components/IncidentCard"
import { EmptyIncidentState } from "@/features/incidents/components/EmptyIncidentState"
import { useIncidents } from "@/features/incidents/hooks/useIncidents"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"
import styles from "@/features/incidents/pages/IncidentListPage.module.scss"

export const IncidentListPage = () => {
  const { incidents, loading, error } = useIncidents()
  const navigate = useNavigate()

  if (loading) {
    return <p>Loading incidents...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (incidents.length === 0) {
    return <EmptyIncidentState />
  }

  return (
    <div>
      <h2>Incident List Page</h2>

      <Button label="Create incident" onClick={() => navigate("/incidents/create")} />

      {incidents.map((incident) => (
        <div key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)} className={styles.listItem}>
          <IncidentCard incident={incident} />
        </div>
      ))}
    </div>
  )
}

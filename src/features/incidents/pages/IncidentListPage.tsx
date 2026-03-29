import { IncidentCard } from "../components/IncidentCard"
import { useIncidents } from "../hooks/useIncidents"

export const IncidentListPage = () => {
  const { incidents, loading, error } = useIncidents()

  return (
    <div>
      <h2>Incident List Page</h2>
      {loading && <p>Loading incidents...</p>}
      {error && <p>{error}</p>}
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  )
}

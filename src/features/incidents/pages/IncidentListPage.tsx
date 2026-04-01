import { IncidentCard } from "@/features/incidents/components/IncidentCard"
import { EmptyIncidentState } from "@/features/incidents/components/EmptyIncidentState"
import { useIncidents } from "@/features/incidents/hooks/useIncidents"

export const IncidentListPage = () => {
  const { incidents, loading, error } = useIncidents()

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

      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  )
}


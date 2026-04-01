import { useParams, useNavigate } from "react-router-dom"
import { useIncidentDetails } from "@/features/incidents/hooks/useIncidentDetails"
import { Button } from "@/components/ui/Button"
import { IncidentDetail } from "../components/IncidentDetail"

export const IncidentDetailPage = () => {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const { incident, loading, error } = useIncidentDetails(id)

  if (loading) {
    return <p>Loading incident...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!incident) {
    return <p>Incident not found.</p>
  }

  return (
    <div>
      <IncidentDetail incident={incident} />
      <Button label="Back to list" variant="secondary" onClick={() => navigate("/")} />
    </div>
  )
}

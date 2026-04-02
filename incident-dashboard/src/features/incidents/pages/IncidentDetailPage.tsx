import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useIncidentDetails } from "@/features/incidents/hooks/useIncidentDetails"
import { Button } from "@/components/ui/Button"
import { IncidentDetail } from "../components/IncidentDetail"
import styles from "./IncidentDetailPage.module.scss"

export const IncidentDetailPage = () => {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const { incident, loading, error } = useIncidentDetails(id)

  if (loading) {
    return <p className={styles.state}>Loading incident...</p>
  }

  if (error) {
    return <p className={styles.state}>{error}</p>
  }

  if (!incident) {
    return <p className={styles.state}>Incident not found.</p>
  }

  return (
    <div className={styles.page}>
      <Button
        icon={<ArrowLeft size={16} />}
        label="Back to list"
        variant="secondary"
        onClick={() => navigate("/incidents")}
      />
      <IncidentDetail incident={incident} />
    </div>
  )
}

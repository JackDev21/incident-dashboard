import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useIncidentDetails } from "@/features/incidents/hooks/useIncidentDetails"
import { Button } from "@/components/ui/Button"
import { IncidentDetail } from "../components/IncidentDetail"
import { useTranslation } from "react-i18next"
import styles from "./IncidentDetailPage.module.scss"

export const IncidentDetailPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { id } = useParams<{ id: string }>()
  const { incident, loading, error, updateStatus } = useIncidentDetails(id)

  if (loading) {
    return <p className={styles.state}>{t("incidents.loading")}</p>
  }

  if (error) {
    return <p className={styles.state}>{error.message}</p>
  }

  if (!incident) {
    return <p className={styles.state}>{t("incidents.detail.notFound")}</p>
  }

  return (
    <div className={styles.page}>
      <Button
        icon={<ArrowLeft size={16} />}
        label={t("incidents.detail.backToList")}
        variant="secondary"
        onClick={() => navigate("/incidents")}
      />
      <IncidentDetail incident={incident} onStatusChange={updateStatus} />
    </div>
  )
}

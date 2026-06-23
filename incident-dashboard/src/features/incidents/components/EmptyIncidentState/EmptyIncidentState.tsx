import { useTranslation } from "react-i18next"

export const EmptyIncidentState = () => {
  const { t } = useTranslation()
  return <p>{t("incidents.emptyState")}</p>
}

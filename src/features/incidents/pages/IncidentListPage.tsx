import { useEffect, useState } from "react"

import { getIncidents } from "@/features/incidents/services/incidents.service"
import type { Incident } from "@/features/incidents/types/incident.types"
import { IncidentCard } from "@/features/incidents/components/IncidentCard/IncidentCard"

export const IncidentListPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents()
      setIncidents(data)
    }
    loadIncidents()
  })

  return (
    <div>
      <h2>Incident List Page</h2>
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  )
}

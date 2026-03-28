import { useEffect, useState } from "react"

import { getIncidents } from "../services/incidents.service"
import type { Incident } from "../types/incident.types"
import { IncidentCard } from "../components/IncidentCard/IncidentCard"

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

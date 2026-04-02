import { useEffect, useState } from "react"
import { getIncidents, deleteIncident } from "../services/incidents.service"
import type { Incident } from "../types/incident.types"

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getIncidents()
        setIncidents(data)
      } catch {
        setError("Failed to load incidents")
      } finally {
        setLoading(false)
      }
    }

    loadIncidents()
  }, [])

  const removeIncident = async (id: string) => {
    try {
      await deleteIncident(id)
      setIncidents((prev) => prev.filter((incident) => incident.id !== id))
    } catch {
      setError("Failed to delete incident")
    }
  }

  return { incidents, loading, error, removeIncident }
}

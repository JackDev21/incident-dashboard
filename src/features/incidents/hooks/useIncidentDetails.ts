import { useEffect, useState } from "react"
import { getIncidentById } from "../services/incidents.service"
import type { Incident } from "../types/incident.types"

export const useIncidentDetails = (id: string | undefined) => {
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Invalid incident id")
      return
    }

    const loadIncident = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getIncidentById(id)

        if (!data) {
          setError("Incident not found")
          return
        }

        setIncident(data)
      } catch {
        setError("Failed to load incident")
      } finally {
        setLoading(false)
      }
    }

    loadIncident()
  }, [id])

  return { incident, loading, error }
}

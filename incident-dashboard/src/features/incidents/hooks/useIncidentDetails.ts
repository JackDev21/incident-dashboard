import { getIncidentById } from "../services/incidents.service"
import { useQuery } from "@tanstack/react-query"

export const useIncidentDetails = (id: string | undefined) => {
  const {
    data: incident = null,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["incidents", id],
    queryFn: () => getIncidentById(id!),
    enabled: !!id,
  })
  return { incident, loading, error }
}

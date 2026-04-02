import { getIncidentById, updateIncident } from "../services/incidents.service"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import type { IncidentStatus } from "../types/incident.types"

export const useIncidentDetails = (id: string | undefined) => {
  const queryClient = useQueryClient()

  const {
    data: incident = null,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["incidents", id],
    queryFn: () => getIncidentById(id!),
    enabled: !!id,
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: IncidentStatus) => updateIncident(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents", id] })
    },
  })

  return { incident, loading, error, updateStatus }
}

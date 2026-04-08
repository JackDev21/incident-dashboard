import { getIncidentById, updateIncident } from "../services/incidents.service"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import type { IncidentStatus } from "../types/incident.types"
import { useToast } from "@/app/context/useToast"
import type { Incident } from "../types/incident.types"

export const useIncidentDetails = (id: string | undefined) => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

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
    onSuccess: (data: Incident) => {
      console.log("[Mutation] updateIncident success", data)
      queryClient.invalidateQueries({ queryKey: ["incidents", id] })
      showToast("Incident updated", "warning")
    },
  })

  return { incident, loading, error, updateStatus }
}

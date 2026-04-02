import { getIncidents, deleteIncident } from "../services/incidents.service"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"

export const useIncidents = () => {
  const queryClient = useQueryClient()

  const {
    data: incidents = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  })

  const { mutate: removeIncident } = useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
    },
    onError: (error) => {
      console.error("Error deleting incident:", error)
    },
  })

  return { incidents, loading, error, removeIncident }
}

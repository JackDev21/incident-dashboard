import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { socket } from "../services/socket"
import { useToast } from "@/app/context/useToast"
import type { Incident, PaginatedIncidents } from "../types/incident.types"
import { incidentQueryKeys } from "../queryKeys"

export const useIncidentSocket = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  useEffect(() => {
    let registered = false

    const onCreated = (incident: Incident) => {
      console.log("[WS-hook] received event: incident:created", incident)

      queryClient.setQueriesData({ queryKey: incidentQueryKeys.lists() }, (oldData: PaginatedIncidents | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: [incident, ...oldData.data],
          total: (oldData.total || 0) + 1,
          totalPages: Math.ceil(((oldData.total || 0) + 1) / 12),
        }
      })

      showToast("New incident created", "success")
    }

    const onUpdated = (incident: Incident) => {
      console.log("[WS-hook] received event: incident:updated", incident)

      queryClient.setQueriesData({ queryKey: incidentQueryKeys.lists() }, (oldData: PaginatedIncidents | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: oldData.data.map((i: Incident) => (i.id === incident.id ? incident : i)),
        }
      })

      queryClient.setQueryData(incidentQueryKeys.detail(incident.id), incident)

      showToast("Incident updated", "warning")
    }

    const onDeleted = (payload: { id: string }) => {
      console.log("[WS-hook] received event: incident:deleted", payload)

      queryClient.setQueriesData({ queryKey: incidentQueryKeys.lists() }, (oldData: PaginatedIncidents | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: oldData.data.filter((i: Incident) => i.id !== payload.id),
          total: (oldData.total || 0) - 1,
          totalPages: Math.ceil(((oldData.total || 0) - 1) / 12),
        }
      })

      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.detail(payload.id) })

      showToast("Incident deleted", "danger")
    }

    const register = () => {
      if (registered) return
      registered = true
      console.log("[WS-hook] registering listeners, socket id:", socket.id)
      socket.on("incident:created", onCreated)
      socket.on("incident:updated", onUpdated)
      socket.on("incident:deleted", onDeleted)
    }

    const unregister = () => {
      if (!registered) return
      registered = false
      console.log("[WS-hook] unregistering listeners")
      socket.off("incident:created", onCreated)
      socket.off("incident:updated", onUpdated)
      socket.off("incident:deleted", onDeleted)
    }

    const handleConnect = () => register()

    if (socket.connected) {
      register()
    } else {
      socket.once("connect", handleConnect)
    }

    return () => {
      unregister()
      socket.off("connect", handleConnect)
    }
  }, [queryClient, showToast])
}

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { socket } from "../services/socket"
import { useToast } from "@/app/context/useToast"
import type { Incident } from "../types/incident.types"

export const useIncidentSocket = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  useEffect(() => {
    let registered = false

    const onCreated = (incident: Incident) => {
      console.log("[WS-hook] received event: incident:created", incident)
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      showToast("New incident created", "success")
    }

    const onUpdated = (incident: Incident) => {
      console.log("[WS-hook] received event: incident:updated", incident)
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      showToast("Incident updated", "warning")
    }

    const onDeleted = (payload: { id: string }) => {
      console.log("[WS-hook] received event: incident:deleted", payload)
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
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

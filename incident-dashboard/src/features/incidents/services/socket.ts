import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3000"

export const socket = io(SOCKET_URL, {
  autoConnect: true,
})

socket.on("connect", () => {
  console.log("[WS] Connected:", socket.id)
})

socket.on("disconnect", () => {
  console.log("[WS] Disconnected")
})

socket.on("incident:created", (data) => {
  console.log("[WS] incident:created", data)
})

socket.on("incident:updated", (data) => {
  console.log("[WS] incident:updated", data)
})

socket.on("incident:deleted", (data) => {
  console.log("[WS] incident:deleted", data)
})

// Debug: log any incoming WS event (useful to confirm frames in DevTools)
socket.onAny((event, ...args) => {
  console.log("[WS-any]", event, args)
})

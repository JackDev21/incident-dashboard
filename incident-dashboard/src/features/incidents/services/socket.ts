import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3000"

const getStoredToken = (): string | null => {
  const token = localStorage.getItem("auth_token")
  if (!token || token === "undefined" || token === "null") return null
  return token
}

export const socket = io(SOCKET_URL, {
  autoConnect: false,
})

export const connectSocketWithAuth = () => {
  const token = getStoredToken()
  if (!token) {
    socket.disconnect()
    return
  }

  socket.auth = { token }
  if (!socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  socket.disconnect()
}

export const refreshSocketAuth = () => {
  if (socket.connected) {
    socket.disconnect()
  }
  connectSocketWithAuth()
}

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

// Reconnect on page load when there is a valid session token.
connectSocketWithAuth()

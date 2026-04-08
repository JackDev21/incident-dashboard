import { Socket } from "socket.io"

const MAX_CONNECTIONS_PER_IP = 5
const MSG_LIMIT_PER_WINDOW = 10
const WINDOW_MS = 5000 // 5 seconds

const connectionCounts = new Map<string, number>()
const socketRateLimits = new Map<string, { count: number; lastReset: number }>()

/**
 * Middleware to limit the number of connections per IP
 */
export const socketConnectionLimiter = (socket: Socket, next: (err?: Error) => void) => {
  const ip = socket.handshake.address || "unknown"
  const currentCount = connectionCounts.get(ip) || 0

  if (currentCount >= MAX_CONNECTIONS_PER_IP) {
    return next(new Error("Too many connections from this IP"))
  }

  connectionCounts.set(ip, currentCount + 1)

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const count = connectionCounts.get(ip) || 1
    if (count <= 1) {
      connectionCounts.delete(ip)
    } else {
      connectionCounts.set(ip, count - 1)
    }
  })

  next()
}

/**
 * Wrapper to limit the frequency of events sent by a socket
 */
export const withSocketThrottle = (socket: Socket, handler: (...args: any[]) => void) => {
  return (...args: any[]) => {
    const socketId = socket.id || ""
    const now = Date.now()
    const rate = socketRateLimits.get(socketId) || { count: 0, lastReset: now }

    // Reset time window
    if (now - rate.lastReset > WINDOW_MS) {
      rate.count = 0
      rate.lastReset = now
    }

    rate.count++
    socketRateLimits.set(socketId, rate)

    if (rate.count > MSG_LIMIT_PER_WINDOW) {
      socket.emit("security_warning", {
        message: "You are sending messages too fast. Please wait a few seconds.",
      })
      return
    }

    return handler(...args)
  }
}

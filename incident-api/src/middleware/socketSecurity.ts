import { Socket } from "socket.io";

const MAX_CONNECTIONS_PER_IP = 5;
const MSG_LIMIT_PER_WINDOW = 10;
const WINDOW_MS = 5000; // 5 segundos

const connectionCounts = new Map<string, number>();
const socketRateLimits = new Map<string, { count: number; lastReset: number }>();

/**
 * Middleware para limitar la cantidad de conexiones por IP
 */
export const socketConnectionLimiter = (socket: Socket, next: (err?: Error) => void) => {
  const ip = socket.handshake.address || "unknown";
  const currentCount = connectionCounts.get(ip) || 0;

  if (currentCount >= MAX_CONNECTIONS_PER_IP) {
    return next(new Error("Too many connections from this IP"));
  }

  connectionCounts.set(ip, currentCount + 1);
  
  // Limpieza cuando el socket se desconecta
  socket.on("disconnect", () => {
    const count = connectionCounts.get(ip) || 1;
    if (count <= 1) {
      connectionCounts.delete(ip);
    } else {
      connectionCounts.set(ip, count - 1);
    }
  });

  next();
};

/**
 * Wrapper para limitar la frecuencia de eventos enviados por un socket
 */
export const withSocketThrottle = (socket: Socket, handler: (...args: any[]) => void) => {
  return (...args: any[]) => {
    const socketId = socket.id || "";
    const now = Date.now();
    const rate = socketRateLimits.get(socketId) || { count: 0, lastReset: now };

    // Reiniciar ventana de tiempo
    if (now - rate.lastReset > WINDOW_MS) {
      rate.count = 0;
      rate.lastReset = now;
    }

    rate.count++;
    socketRateLimits.set(socketId, rate);

    if (rate.count > MSG_LIMIT_PER_WINDOW) {
      socket.emit("security_warning", { 
        message: "Estás enviando mensajes demasiado rápido. Por favor, espera unos segundos." 
      });
      return;
    }

    return handler(...args);
  };
};

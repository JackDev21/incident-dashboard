import type { Incident } from "@/features/incidents/types/incident.types"

export const incidentsMock: Incident[] = [
  {
    id: "1",
    title: "Error al iniciar sesión",
    description: "Algunos usuarios no pueden acceder a la aplicación con sus credenciales.",
    status: "open",
    priority: "high",
    assignee: "Jose",
    createdAt: "2026-03-28",
  },
  {
    id: "2",
    title: "Fallo visual en el dashboard",
    description: "Los badges de estado se desalinean en pantallas pequeñas.",
    status: "in_progress",
    priority: "medium",
    assignee: "Ana",
    createdAt: "2026-03-27",
  },
  {
    id: "3",
    title: "Notificación duplicada",
    description: "Se envían notificaciones push duplicadas al publicar contenido.",
    status: "resolved",
    priority: "low",
    assignee: "Carlos",
    createdAt: "2026-03-25",
  },
]

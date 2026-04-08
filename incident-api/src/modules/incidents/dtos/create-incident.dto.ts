import { z } from "zod"

// Esquema para la creación de un incidente
export const CreateIncidentSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z.string().min(1, "Assignee is required").trim(),
})

// Esquema para la actualización
export const UpdateIncidentSchema = z
  .object({
    title: z.string().min(1, "Title must be non-empty").trim().optional(),
    description: z.string().min(1, "Description must be non-empty").trim().optional(),
    status: z.enum(["open", "in progress", "resolved"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assignee: z.string().min(1, "Assignee must be non-empty").trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No valid fields to update",
  })

export type CreateIncidentDTO = z.infer<typeof CreateIncidentSchema>
export type UpdateIncidentDTO = z.infer<typeof UpdateIncidentSchema>

// Wrappers for backward compatibility with tests and other parts of the app
export const validateCreateIncident = (data: unknown): CreateIncidentDTO => {
  return CreateIncidentSchema.parse(data)
}

export const validateUpdateIncident = (data: unknown): UpdateIncidentDTO => {
  return UpdateIncidentSchema.parse(data)
}

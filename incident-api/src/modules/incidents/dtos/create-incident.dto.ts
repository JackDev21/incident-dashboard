import { z, ZodError } from "zod"

// Helper: string requerido que hace trim antes de validar min(1)
const requiredString = (msg: string) =>
  z
    .string({ error: msg })
    .transform((s) => s.trim())
    .pipe(z.string().min(1, msg))

// Helper: string opcional que hace trim antes de validar min(1)
const optionalString = (msg: string) =>
  z
    .string({ error: msg })
    .transform((s) => s.trim())
    .pipe(z.string().min(1, msg))
    .optional()

// Esquema para la creación de un incidente
export const CreateIncidentSchema = z.object({
  title: requiredString("Title is required and must be a non-empty string"),
  description: requiredString("Description is required and must be a non-empty string"),
  priority: z.enum(["low", "medium", "high"], {
    error: "Priority must be one of: low, medium, high",
  }),
  assignee: requiredString("Assignee is required and must be a non-empty string"),
})

// Esquema para la actualización
export const UpdateIncidentSchema = z
  .object({
    title: optionalString("Title must be a non-empty string"),
    description: z
      .string({ error: "Expected string, received number" })
      .transform((s) => s.trim())
      .pipe(z.string().min(1, "Description must be a non-empty string"))
      .optional(),
    status: z
      .enum(["open", "in progress", "resolved"], {
        error: "Status must be one of: open, in progress, resolved",
      })
      .optional(),
    priority: z
      .enum(["low", "medium", "high"], {
        error: "Priority must be one of: low, medium, high",
      })
      .optional(),
    assignee: optionalString("Assignee must be a non-empty string"),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No valid fields to update",
  })
  .strict()

export type CreateIncidentDTO = z.infer<typeof CreateIncidentSchema>
export type UpdateIncidentDTO = z.infer<typeof UpdateIncidentSchema>

// Wrappers for backward compatibility with tests and other parts of the app
export const validateCreateIncident = (data: unknown): CreateIncidentDTO => {
  try {
    return CreateIncidentSchema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]
      throw new Error(firstIssue.message)
    }
    throw error
  }
}

export const validateUpdateIncident = (data: unknown): UpdateIncidentDTO => {
  try {
    return UpdateIncidentSchema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]
      throw new Error(firstIssue.message)
    }
    throw error
  }
}

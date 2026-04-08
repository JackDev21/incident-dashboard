import { Router } from "express"
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getAssignees,
} from "./incident.controller"
import { asyncHandler } from "../../middleware/errorHandler"
import { validateBody, validateQuery } from "../../middleware/validate"
import { CreateIncidentSchema, UpdateIncidentSchema } from "./dtos/create-incident.dto"
import { z } from "zod"

const router = Router()

const IncidentFilterSchema = z.object({
  status: z.enum(["open", "in progress", "resolved"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignee: z.string().optional(),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
})

router.get("/assignees", asyncHandler(getAssignees))
router.get("/", validateQuery(IncidentFilterSchema), asyncHandler(getIncidents))
router.get("/:id", asyncHandler(getIncidentById))
router.post("/", validateBody(CreateIncidentSchema), asyncHandler(createIncident))
router.put("/:id", validateBody(UpdateIncidentSchema), asyncHandler(updateIncident))
router.delete("/:id", asyncHandler(deleteIncident))

export default router

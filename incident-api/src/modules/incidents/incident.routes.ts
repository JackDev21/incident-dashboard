import { Router } from "express"
import { getIncidents, getIncidentById, createIncident, updateIncident, deleteIncident } from "./incident.controller"
import { validateRequest, asyncHandler } from "../../middleware/errorHandler"
import { validateCreateIncident, validateUpdateIncident } from "./dtos/create-incident.dto"

const router = Router()

router.get("/", asyncHandler(getIncidents))
router.get("/:id", asyncHandler(getIncidentById))
router.post("/", validateRequest(validateCreateIncident), asyncHandler(createIncident))
router.put("/:id", validateRequest(validateUpdateIncident), asyncHandler(updateIncident))
router.delete("/:id", asyncHandler(deleteIncident))

export default router

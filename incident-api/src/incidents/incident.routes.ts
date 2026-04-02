import { Router } from "express"
import { getIncidents, getIncidentById, createIncident, updateIncident, deleteIncident } from "./incident.controller"

const router = Router()

router.get("/", getIncidents)
router.get("/:id", getIncidentById)
router.post("/", createIncident)
router.put("/:id", updateIncident)
router.delete("/:id", deleteIncident)

export default router

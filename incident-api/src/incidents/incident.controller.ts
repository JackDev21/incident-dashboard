import type { Request, Response } from "express"
import { Incident } from "./incident.model"

export const getIncidents = async (_req: Request, res: Response): Promise<void> => {
  const incidents = await Incident.find().sort({ createdAt: -1 })
  res.json(incidents)
}

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  const incident = await Incident.findById(req.params.id)
  if (!incident) {
    res.status(404).json({ message: "Incident not found" })
    return
  }
  res.json(incident)
}

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  const incident = new Incident(req.body)
  const saved = await incident.save()
  res.status(201).json(saved)
}

export const updateIncident = async (req: Request, res: Response): Promise<void> => {
  const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!incident) {
    res.status(404).json({ message: "Incident not found" })
    return
  }
  res.json(incident)
}

export const deleteIncident = async (req: Request, res: Response): Promise<void> => {
  const incident = await Incident.findByIdAndDelete(req.params.id)
  if (!incident) {
    res.status(404).json({ message: "Incident not found" })
    return
  }
  res.status(204).send()
}

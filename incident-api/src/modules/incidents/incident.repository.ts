import { IncidentModel } from "./incident.model"
import { QueryFilter } from "mongoose"
import { Incident } from "./incident.types"

export const incidentRepository = {
  findAll: async (filters: QueryFilter<Incident>) => {
    return await IncidentModel.find(filters).sort({ createdAt: -1 }).populate("creatorId", "name")
  },

  findAllPaginated: async (page: number, limit: number, filters: QueryFilter<Incident>) => {
    return await IncidentModel.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("creatorId", "name")
  },

  count: async (filters: QueryFilter<Incident>) => {
    return await IncidentModel.countDocuments(filters)
  },

  findById: async (id: string) => {
    return await IncidentModel.findById(id).populate("creatorId", "name")
  },

  create: async (data: any) => {
    const doc = await IncidentModel.create(data)
    return await doc.populate("creatorId", "name")
  },

  update: async (id: string, data: Partial<Incident>) => {
    return await IncidentModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      "creatorId",
      "name",
    )
  },

  delete: async (id: string) => {
    return await IncidentModel.findByIdAndDelete(id)
  },

  getUniqueAssignees: async () => {
    return await IncidentModel.distinct("assignee")
  },
}

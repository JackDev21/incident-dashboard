import { Schema, model, Document } from "mongoose"

export type IncidentStatus = "open" | "in progress" | "resolved"
export type IncidentPriority = "low" | "medium" | "high"

export interface IIncident extends Document {
  title: string
  description: string
  status: IncidentStatus
  priority: IncidentPriority
  assignee: string
  createdAt: Date
}

const incidentSchema = new Schema<IIncident>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "in progress", "resolved"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    assignee: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

export const Incident = model<IIncident>("Incident", incidentSchema)

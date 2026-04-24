import { Schema, model } from "mongoose"
import type { Incident } from "../types/incidentTypes"

const incidentSchema = new Schema<Incident>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "in progress", "resolved"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    assignee: { type: String, required: true, trim: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
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

export const IncidentModel = model<Incident>("Incident", incidentSchema)

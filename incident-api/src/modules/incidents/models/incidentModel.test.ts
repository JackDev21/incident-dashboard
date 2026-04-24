import { IncidentModel } from "./incidentModel"


describe("incident model schema", () => {
  it("applies defaults and JSON transform", () => {
    const incident = new IncidentModel({
      title: "API Down",
      description: "Main API is not responding",
      priority: "high",
      assignee: "Ana",
    })

    const json = incident.toJSON() as unknown as Record<string, unknown>

    expect(json.status).toBe("open")
    expect(json.id).toBeDefined()
    expect(json).not.toHaveProperty("_id")
    expect(json).not.toHaveProperty("__v")
  })

  it("defines expected enum and timestamps options", () => {
    const statusPath = IncidentModel.schema.path("status") as unknown as {
      options: { enum: string[] }
    }

    expect(statusPath.options.enum).toEqual(["open", "in progress", "resolved"])
    expect(IncidentModel.schema.options.timestamps).toBe(true)
  })
})

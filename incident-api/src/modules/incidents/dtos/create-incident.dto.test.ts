import { validateCreateIncident, validateUpdateIncident } from "./create-incident.dto"

describe("validateCreateIncident", () => {
  it("returns normalized payload when input is valid", () => {
    const result = validateCreateIncident({
      title: "  API Down  ",
      description: "  Main API is not responding  ",
      priority: "high",
      assignee: "  Ana  ",
    })

    expect(result).toEqual({
      title: "API Down",
      description: "Main API is not responding",
      priority: "high",
      assignee: "Ana",
    })
  })

  it("throws when title is missing", () => {
    expect(() =>
      validateCreateIncident({
        description: "desc",
        priority: "low",
        assignee: "Ana",
      }),
    ).toThrow("Title is required and must be a non-empty string")
  })

  it("throws when priority is invalid", () => {
    expect(() =>
      validateCreateIncident({
        title: "API Down",
        description: "Main API is not responding",
        priority: "urgent",
        assignee: "Ana",
      }),
    ).toThrow("Priority must be one of: low, medium, high")
  })

  it("throws when assignee is blank after trim", () => {
    expect(() =>
      validateCreateIncident({
        title: "API Down",
        description: "Main API is not responding",
        priority: "high",
        assignee: "   ",
      }),
    ).toThrow("Assignee is required and must be a non-empty string")
  })

  it("throws when description is blank after trim", () => {
    expect(() =>
      validateCreateIncident({
        title: "API Down",
        description: "   ",
        priority: "high",
        assignee: "Ana",
      }),
    ).toThrow("Description is required and must be a non-empty string")
  })
})

describe("validateUpdateIncident", () => {
  it("returns only valid update fields", () => {
    const result = validateUpdateIncident({ status: "resolved", assignee: "  Jose  " })

    expect(result).toEqual({ status: "resolved", assignee: "Jose" })
  })

  it("returns normalized description when only description is provided", () => {
    const result = validateUpdateIncident({ description: "  Service recovered  " })

    expect(result).toEqual({ description: "Service recovered" })
  })

  it("returns all valid update fields normalized", () => {
    const result = validateUpdateIncident({
      title: "  API Up  ",
      description: "  Recovered after restart  ",
      status: "in progress",
      priority: "medium",
      assignee: "  Ana  ",
    })

    expect(result).toEqual({
      title: "API Up",
      description: "Recovered after restart",
      status: "in progress",
      priority: "medium",
      assignee: "Ana",
    })
  })

  it("throws when no valid fields are provided", () => {
    expect(() => validateUpdateIncident({})).toThrow("No valid fields to update")
  })

  it("throws when status is invalid", () => {
    expect(() => validateUpdateIncident({ status: "closed" })).toThrow(
      "Status must be one of: open, in progress, resolved",
    )
  })

  it("throws when priority is invalid", () => {
    expect(() => validateUpdateIncident({ priority: "critical" })).toThrow("Priority must be one of: low, medium, high")
  })

  it("throws when title is blank after trim", () => {
    expect(() => validateUpdateIncident({ title: "   " })).toThrow("Title must be a non-empty string")
  })

  it("throws when assignee is blank after trim", () => {
    expect(() => validateUpdateIncident({ assignee: "   " })).toThrow("Assignee must be a non-empty string")
  })

  it("throws when description is not a string", () => {
    expect(() => validateUpdateIncident({ description: 123 })).toThrow("Expected string, received number")
  })
})

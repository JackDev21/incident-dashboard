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
})

describe("validateUpdateIncident", () => {
  it("returns only valid update fields", () => {
    const result = validateUpdateIncident({ status: "resolved", assignee: "  Jose  " })

    expect(result).toEqual({ status: "resolved", assignee: "Jose" })
  })

  it("throws when no valid fields are provided", () => {
    expect(() => validateUpdateIncident({})).toThrow("No valid fields to update")
  })
})

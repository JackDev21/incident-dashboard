import { createAppError } from "../../middleware"
import { IncidentModel } from "./incident.model"
import { createIncident, deleteIncident, getAllIncidents, getIncidentById, updateIncident } from "./incident.service"

jest.mock("./incident.model", () => {
  const IncidentModelMock: any = jest.fn()
  IncidentModelMock.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn(),
      }),
    }),
  })
  IncidentModelMock.findById = jest.fn()
  IncidentModelMock.findByIdAndUpdate = jest.fn()
  IncidentModelMock.findByIdAndDelete = jest.fn()
  IncidentModelMock.countDocuments = jest.fn()
  return { IncidentModel: IncidentModelMock }
})

type MockedIncidentModelType = jest.Mock & {
  find: jest.Mock
  findById: jest.Mock
  findByIdAndUpdate: jest.Mock
  findByIdAndDelete: jest.Mock
  countDocuments: jest.Mock
}

const MockedIncidentModel = IncidentModel as unknown as MockedIncidentModelType

describe("incident service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("gets all incidents sorted by createdAt desc", async () => {
    const incidents = [{ id: "1", title: "API Down" }]
    const sortMock = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(incidents),
      }),
    })
    const countDocumentsMock = jest.fn().mockResolvedValue(1)

    MockedIncidentModel.find.mockReturnValue({ sort: sortMock })
    MockedIncidentModel.countDocuments.mockImplementation(countDocumentsMock)

    const result = await getAllIncidents(1, 12)

    expect(MockedIncidentModel.find).toHaveBeenCalledWith({})
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
    expect(countDocumentsMock).toHaveBeenCalledWith({})
    expect(result).toEqual({ data: incidents, total: 1, page: 1, totalPages: 1 })
  })

  it("filters incidents by assignee accent-insensitively for web filters", async () => {
    const incidents = [
      { id: "1", title: "API Down", assignee: "Laura Martín" },
      { id: "2", title: "Queue delay", assignee: "Laura" },
    ]
    const sortMock = jest.fn().mockResolvedValue(incidents)

    MockedIncidentModel.find.mockReturnValue({ sort: sortMock })

    const result = await getAllIncidents(1, 12, { assignee: "laura martin" })

    expect(MockedIncidentModel.find).toHaveBeenCalledWith({})
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
    expect(MockedIncidentModel.countDocuments).not.toHaveBeenCalled()
    expect(result).toEqual({
      data: [{ id: "1", title: "API Down", assignee: "Laura Martín" }],
      total: 1,
      page: 1,
      totalPages: 1,
    })
  })

  it("gets one incident by id", async () => {
    const incident = { id: "incident-1", title: "API Down" }
    MockedIncidentModel.findById.mockResolvedValue(incident)

    const result = await getIncidentById("incident-1")

    expect(result).toEqual(incident)
    expect(MockedIncidentModel.findById).toHaveBeenCalledWith("incident-1")
  })

  it("throws 404 when incident is not found by id", async () => {
    MockedIncidentModel.findById.mockResolvedValue(null)

    await expect(getIncidentById("missing-id")).rejects.toMatchObject({
      statusCode: 404,
      message: "Incident with ID missing-id not found",
    })
  })

  it("creates an incident with default status open", async () => {
    const saveMock = jest.fn().mockResolvedValue({ id: "incident-1", status: "open" })
    MockedIncidentModel.mockImplementation(() => ({ save: saveMock }) as never)

    const result = await createIncident({
      title: "API Down",
      description: "Main API is not responding",
      priority: "high",
      assignee: "Ana",
    })

    expect(MockedIncidentModel).toHaveBeenCalledWith({
      title: "API Down",
      description: "Main API is not responding",
      status: "open",
      priority: "high",
      assignee: "Ana",
    })
    expect(saveMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ id: "incident-1", status: "open" })
  })

  it("throws 400 when create fails with regular error", async () => {
    const saveMock = jest.fn().mockRejectedValue(new Error("validation failed"))
    MockedIncidentModel.mockImplementation(() => ({ save: saveMock }) as never)

    await expect(
      createIncident({
        title: "API Down",
        description: "Main API is not responding",
        priority: "high",
        assignee: "Ana",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Failed to create incident: validation failed",
    })
  })

  it("rethrows non-Error values during create", async () => {
    const unknownError = { reason: "unknown" }
    const saveMock = jest.fn().mockRejectedValue(unknownError)
    MockedIncidentModel.mockImplementation(() => ({ save: saveMock }) as never)

    await expect(
      createIncident({
        title: "API Down",
        description: "Main API is not responding",
        priority: "high",
        assignee: "Ana",
      }),
    ).rejects.toBe(unknownError)
  })

  it("updates an incident and returns the updated document", async () => {
    const updatedIncident = { id: "incident-1", status: "resolved" }
    MockedIncidentModel.findByIdAndUpdate.mockResolvedValue(updatedIncident)

    const result = await updateIncident("incident-1", { status: "resolved" })

    expect(MockedIncidentModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "incident-1",
      { status: "resolved" },
      { new: true, runValidators: true },
    )
    expect(result).toEqual(updatedIncident)
  })

  it("throws 404 when updating a missing incident", async () => {
    MockedIncidentModel.findByIdAndUpdate.mockResolvedValue(null)

    await expect(updateIncident("missing-id", { status: "resolved" })).rejects.toMatchObject({
      statusCode: 404,
      message: "Incident with ID missing-id not found",
    })
  })

  it("throws 400 when update fails with regular error", async () => {
    MockedIncidentModel.findByIdAndUpdate.mockRejectedValue(new Error("invalid status"))

    await expect(updateIncident("incident-1", { status: "resolved" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Failed to update incident: invalid status",
    })
  })

  it("rethrows AppError during update", async () => {
    MockedIncidentModel.findByIdAndUpdate.mockRejectedValue(createAppError(409, "Conflict"))

    await expect(updateIncident("incident-1", { status: "resolved" })).rejects.toMatchObject({
      statusCode: 409,
      message: "Conflict",
    })
  })

  it("rethrows non-Error values during update", async () => {
    const unknownError = { reason: "unknown" }
    MockedIncidentModel.findByIdAndUpdate.mockRejectedValue(unknownError)

    await expect(updateIncident("incident-1", { status: "resolved" })).rejects.toBe(unknownError)
  })

  it("deletes an incident successfully", async () => {
    MockedIncidentModel.findByIdAndDelete.mockResolvedValue({ id: "incident-1" })

    await expect(deleteIncident("incident-1")).resolves.toBeUndefined()
    expect(MockedIncidentModel.findByIdAndDelete).toHaveBeenCalledWith("incident-1")
  })

  it("throws 404 when deleting a missing incident", async () => {
    MockedIncidentModel.findByIdAndDelete.mockResolvedValue(null)

    await expect(deleteIncident("missing-id")).rejects.toMatchObject({
      statusCode: 404,
      message: "Incident with ID missing-id not found",
    })
  })
})

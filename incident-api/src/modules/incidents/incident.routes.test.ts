import express from "express"
import request from "supertest"
import incidentRoutes from "./incident.routes"
import * as incidentService from "./incident.service"
import { createAppError } from "../../middleware"
import { errorHandler, notFound } from "../../middleware"

jest.mock("./incident.service", () => ({
  createIncident: jest.fn(),
  getAllIncidents: jest.fn(),
  getIncidentById: jest.fn(),
  updateIncident: jest.fn(),
  deleteIncident: jest.fn(),
}))

describe("incident routes validation", () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  const createApp = () => {
    const app = express()
    app.use(express.json())
    app.use("/api/incidents", incidentRoutes)
    app.use(notFound)
    app.use(errorHandler)
    return app
  }

  it("returns 400 when POST /api/incidents payload is invalid", async () => {
    const app = createApp()

    const response = await request(app).post("/api/incidents").send({
      title: "",
      description: "Example description",
      priority: "high",
      assignee: "Ana",
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      success: false,
      error: "Title is required and must be a non-empty string",
    })
  })

  it("returns 400 when request body contains malformed JSON", async () => {
    const app = createApp()

    const response = await request(app)
      .post("/api/incidents")
      .set("Content-Type", "application/json")
      .send('{"title": "Broken JSON"')

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(typeof response.body.error).toBe("string")
    expect(response.body.error.length).toBeGreaterThan(0)
  })

  it("returns 201 when POST /api/incidents payload is valid", async () => {
    const app = createApp()
    const mockedCreateIncident = incidentService.createIncident as jest.MockedFunction<
      typeof incidentService.createIncident
    >

    mockedCreateIncident.mockResolvedValue({
      id: "incident-1",
      title: "API Down",
      description: "Main API is not responding",
      status: "open",
      priority: "high",
      assignee: "Ana",
      createdAt: new Date("2026-04-04T10:00:00.000Z"),
    } as never)

    const response = await request(app).post("/api/incidents").send({
      title: "API Down",
      description: "Main API is not responding",
      priority: "high",
      assignee: "Ana",
    })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe("Incident created successfully")
    expect(response.body.data).toMatchObject({
      title: "API Down",
      description: "Main API is not responding",
      status: "open",
      priority: "high",
      assignee: "Ana",
    })
    expect(mockedCreateIncident).toHaveBeenCalledWith({
      title: "API Down",
      description: "Main API is not responding",
      priority: "high",
      assignee: "Ana",
    })
  })

  it("returns 200 and incident list when GET /api/incidents succeeds", async () => {
    const app = createApp()
    const mockedGetAllIncidents = incidentService.getAllIncidents as jest.MockedFunction<
      typeof incidentService.getAllIncidents
    >

    mockedGetAllIncidents.mockResolvedValue([
      {
        id: "incident-1",
        title: "API Down",
        description: "Main API is not responding",
        status: "open",
        priority: "high",
        assignee: "Ana",
        createdAt: new Date("2026-04-04T10:00:00.000Z"),
      },
    ] as never)

    const response = await request(app).get("/api/incidents")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe("Incidents retrieved successfully")
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      title: "API Down",
      description: "Main API is not responding",
      status: "open",
      priority: "high",
      assignee: "Ana",
    })
    expect(mockedGetAllIncidents).toHaveBeenCalledTimes(1)
  })

  it("returns 200 and incident detail when GET /api/incidents/:id succeeds", async () => {
    const app = createApp()
    const mockedGetIncidentById = incidentService.getIncidentById as jest.MockedFunction<
      typeof incidentService.getIncidentById
    >

    mockedGetIncidentById.mockResolvedValue({
      id: "incident-1",
      title: "API Down",
      description: "Main API is not responding",
      status: "open",
      priority: "high",
      assignee: "Ana",
      createdAt: new Date("2026-04-04T10:00:00.000Z"),
    } as never)

    const response = await request(app).get("/api/incidents/incident-1")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe("Incident retrieved successfully")
    expect(response.body.data).toMatchObject({
      title: "API Down",
      description: "Main API is not responding",
      status: "open",
      priority: "high",
      assignee: "Ana",
    })
    expect(mockedGetIncidentById).toHaveBeenCalledWith("incident-1")
  })

  it("returns 404 when GET /api/incidents/:id does not find incident", async () => {
    const app = createApp()
    const mockedGetIncidentById = incidentService.getIncidentById as jest.MockedFunction<
      typeof incidentService.getIncidentById
    >

    mockedGetIncidentById.mockRejectedValue(createAppError(404, "Incident with ID missing-id not found"))

    const response = await request(app).get("/api/incidents/missing-id")

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: "Incident with ID missing-id not found",
    })
    expect(mockedGetIncidentById).toHaveBeenCalledWith("missing-id")
  })

  it("returns 400 when PUT /api/incidents/:id payload is invalid", async () => {
    const app = createApp()

    const response = await request(app).put("/api/incidents/incident-1").send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      success: false,
      error: "No valid fields to update",
    })
  })

  it("returns 200 when PUT /api/incidents/:id payload is valid", async () => {
    const app = createApp()
    const mockedUpdateIncident = incidentService.updateIncident as jest.MockedFunction<
      typeof incidentService.updateIncident
    >

    mockedUpdateIncident.mockResolvedValue({
      id: "incident-1",
      title: "API Down",
      description: "Main API is not responding",
      status: "resolved",
      priority: "high",
      assignee: "Ana",
      createdAt: new Date("2026-04-04T10:00:00.000Z"),
    } as never)

    const response = await request(app).put("/api/incidents/incident-1").send({
      status: "resolved",
    })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe("Incident updated successfully")
    expect(response.body.data).toMatchObject({
      id: "incident-1",
      status: "resolved",
    })
    expect(mockedUpdateIncident).toHaveBeenCalledWith("incident-1", { status: "resolved" })
  })

  it("returns 204 when DELETE /api/incidents/:id succeeds", async () => {
    const app = createApp()
    const mockedDeleteIncident = incidentService.deleteIncident as jest.MockedFunction<
      typeof incidentService.deleteIncident
    >

    mockedDeleteIncident.mockResolvedValue(undefined)

    const response = await request(app).delete("/api/incidents/incident-1")

    expect(response.status).toBe(204)
    expect(mockedDeleteIncident).toHaveBeenCalledWith("incident-1")
  })

  it("returns 404 when DELETE /api/incidents/:id does not find incident", async () => {
    const app = createApp()
    const mockedDeleteIncident = incidentService.deleteIncident as jest.MockedFunction<
      typeof incidentService.deleteIncident
    >

    mockedDeleteIncident.mockRejectedValue(createAppError(404, "Incident with ID missing-id not found"))

    const response = await request(app).delete("/api/incidents/missing-id")

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: "Incident with ID missing-id not found",
    })
    expect(mockedDeleteIncident).toHaveBeenCalledWith("missing-id")
  })
})

import * as incidentsModule from "./index"

describe("incidents module barrel", () => {
  it("exports model and service namespace", () => {
    expect(incidentsModule.IncidentModel).toBeDefined()
    expect(incidentsModule.incidentService).toBeDefined()
    expect(incidentsModule.incidentService.getAllIncidents).toBeDefined()
  })

  it("exports controllers and routes", () => {
    expect(incidentsModule.getIncidents).toBeDefined()
    expect(incidentsModule.updateIncident).toBeDefined()
    expect(incidentsModule.incidentRoutes).toBeDefined()
  })
})

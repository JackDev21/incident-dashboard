import * as modules from "./index"

describe("modules barrel exports", () => {
  it("re-exports incidents and chat routes", () => {
    expect(modules.incidentRoutes).toBeDefined()
    expect(modules.chatRoutes).toBeDefined()
  })

  it("re-exports key handlers", () => {
    expect(modules.getIncidents).toBeDefined()
    expect(modules.createIncident).toBeDefined()
    expect(modules.messageChat).toBeDefined()
  })
})

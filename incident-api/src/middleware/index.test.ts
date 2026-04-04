import { notFound, requestLogger } from "./index"

describe("middleware index", () => {
  it("requestLogger logs method and path and calls next", () => {
    const req = { method: "GET", path: "/health" } as any
    const next = jest.fn()
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})

    requestLogger(req, {} as any, next)

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect((consoleLogSpy.mock.calls[0] as unknown[])[0]).toContain("GET /health")
    expect(next).toHaveBeenCalledTimes(1)

    consoleLogSpy.mockRestore()
  })

  it("notFound returns 404 with standard error envelope", () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const res = { status } as any

    notFound({} as any, res)

    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Endpoint not found",
    })
  })
})

import { asyncHandler, createAppError, errorHandler, validateRequest } from "./errorHandler"

describe("errorHandler middleware", () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  const createRes = () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    return { res: { status } as any, status, json }
  }

  it("createAppError builds error with statusCode and details", () => {
    const err = createAppError(422, "Invalid payload", { field: "title" })

    expect(err.message).toBe("Invalid payload")
    expect(err.statusCode).toBe(422)
    expect(err.details).toEqual({ field: "title" })
  })

  it("handles AppError with custom status and details", () => {
    const { res, status, json } = createRes()
    const err = createAppError(404, "Not found", { id: "missing" })

    errorHandler(err, {} as any, res, jest.fn())

    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Not found",
      details: { id: "missing" },
    })
  })

  it("handles JSON syntax errors as 400", () => {
    const { res, status, json } = createRes()
    const syntaxError = new SyntaxError("Unexpected token") as SyntaxError & { body: string }
    syntaxError.body = "{"

    errorHandler(syntaxError, {} as any, res, jest.fn())

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid JSON in request body",
    })
  })

  it("handles regular Error as 500", () => {
    const { res, status, json } = createRes()

    errorHandler(new Error("Boom"), {} as any, res, jest.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Boom",
    })
  })

  it("handles unknown errors as 500", () => {
    const { res, status, json } = createRes()

    errorHandler("unknown", {} as any, res, jest.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error",
    })
  })

  it("validateRequest stores normalized body and calls next", () => {
    const req = { body: { title: "A" } } as any
    const next = jest.fn()

    const middleware = validateRequest((data) => ({ ...(data as Record<string, unknown>), normalized: true }))
    middleware(req, {} as any, next)

    expect(req.body).toEqual({ title: "A", normalized: true })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it("validateRequest throws AppError on validator Error", () => {
    const req = { body: {} } as any

    const middleware = validateRequest(() => {
      throw new Error("Bad input")
    })

    expect(() => middleware(req, {} as any, jest.fn())).toThrow("Bad input")
    try {
      middleware(req, {} as any, jest.fn())
    } catch (err) {
      expect((err as any).statusCode).toBe(400)
    }
  })

  it("validateRequest throws fallback message on non-Error", () => {
    const req = { body: {} } as any

    const middleware = validateRequest(() => {
      throw "oops"
    })

    expect(() => middleware(req, {} as any, jest.fn())).toThrow("Validation error")
  })

  it("asyncHandler forwards rejected promise to next", async () => {
    const next = jest.fn()
    const wrapped = asyncHandler(async () => {
      throw new Error("Async failed")
    })

    wrapped({} as any, {} as any, next)
    await Promise.resolve()

    expect(next).toHaveBeenCalledTimes(1)
    expect((next.mock.calls[0] as unknown[])[0]).toBeInstanceOf(Error)
    expect(((next.mock.calls[0] as unknown[])[0] as Error).message).toBe("Async failed")
  })
})

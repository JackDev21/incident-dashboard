import { sendError, sendPaginatedResponse, sendSuccess } from "./responses"

describe("responses utils", () => {
  const createRes = () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    return { res: { status } as any, status, json }
  }

  it("sendSuccess returns success envelope", () => {
    const { res, status, json } = createRes()

    sendSuccess(res, { id: "1" }, "Created", 201)

    expect(status).toHaveBeenCalledWith(201)
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: { id: "1" },
      message: "Created",
    })
  })

  it("sendError returns error envelope without details by default", () => {
    const { res, status, json } = createRes()

    sendError(res, "Something failed")

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Something failed",
    })
  })

  it("sendError includes details when provided", () => {
    const { res, status, json } = createRes()

    sendError(res, "Validation failed", 400, { field: "title" })

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: "Validation failed",
      details: { field: "title" },
    })
  })

  it("sendPaginatedResponse returns pagination payload", () => {
    const { res, status, json } = createRes()

    sendPaginatedResponse(res, [{ id: 1 }, { id: 2 }], 5, 2, 2)

    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({
      items: [{ id: 1 }, { id: 2 }],
      total: 5,
      page: 2,
      limit: 2,
      totalPages: 3,
    })
  })
})

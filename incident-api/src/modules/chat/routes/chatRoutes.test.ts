import express from "express"
import request from "supertest"
import * as chatService from "../services/chatService"
import { chatRoutes } from ".."
import { notFound } from "../../../middleware"
import { createAppError, errorHandler } from "../../../middleware/http/errorHandler"

jest.mock("../services/chatService", () => ({
  answerQuestion: jest.fn(),
}))

// Mock auth middleware
jest.mock("../../../middleware/http/auth", () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: "user-1", email: "test@example.com" }
    next()
  },
}))

describe("chat routes", () => {
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
    app.use("/api/chat", chatRoutes)
    app.use(notFound)
    app.use(errorHandler)
    return app
  }

  it("returns 400 when question is missing", async () => {
    const app = createApp()

    const response = await request(app).post("/api/chat/query").send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      success: false,
      error: "Validation error",
      details: [
        {
          path: "question",
          message: "Invalid input: expected string, received undefined",
        },
      ],
    })
  })

  it("returns 400 when question is blank after trim", async () => {
    const app = createApp()

    const response = await request(app).post("/api/chat/query").send({ question: "" })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      success: false,
      error: "Validation error",
      details: [
        {
          path: "question",
          message: "Question is required",
        },
      ],
    })
  })

  it("returns 200 with answer and appliedFilters when question is valid", async () => {
    const app = createApp()
    const mockedAnswerQuestion = chatService.answerQuestion as jest.MockedFunction<typeof chatService.answerQuestion>

    mockedAnswerQuestion.mockResolvedValue({
      answer: "There are 3 open incidents.",
      appliedFilters: { status: "open" },
      action: null,
    })

    const response = await request(app).post("/api/chat/query").send({ question: "How many open incidents are there?" })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: "Answer generated successfully",
      data: {
        answer: "There are 3 open incidents.",
        appliedFilters: { status: "open" },
      },
    })
    expect(mockedAnswerQuestion).toHaveBeenCalledWith(
      "How many open incidents are there?",
      [],
      "user-1",
      undefined,
      null,
    )
  })

  it("forwards history to the service when provided", async () => {
    const app = createApp()
    const mockedAnswerQuestion = chatService.answerQuestion as jest.MockedFunction<typeof chatService.answerQuestion>

    mockedAnswerQuestion.mockResolvedValue({
      answer: "Two incidents are assigned to Ana.",
      appliedFilters: { assignee: "Ana" },
      action: null,
    })

    const history = [
      { role: "user" as const, content: "Show me incidents by Ana" },
      { role: "assistant" as const, content: "Ana has 2 incidents." },
    ]

    await request(app).post("/api/chat/query").send({ question: "And how many are high priority?", history })

    expect(mockedAnswerQuestion).toHaveBeenCalledWith(
      "And how many are high priority?",
      history,
      "user-1",
      undefined,
      null,
    )
  })

  it("returns 500 when LLM_API_KEY is not configured", async () => {
    const app = createApp()
    const mockedAnswerQuestion = chatService.answerQuestion as jest.MockedFunction<typeof chatService.answerQuestion>

    mockedAnswerQuestion.mockRejectedValue(createAppError(500, "LLM_API_KEY is not configured"))

    const response = await request(app).post("/api/chat/query").send({ question: "Any open incidents?" })

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      success: false,
      error: "LLM_API_KEY is not configured",
    })
  })

  it("returns 502 when the LLM API returns an error", async () => {
    const app = createApp()
    const mockedAnswerQuestion = chatService.answerQuestion as jest.MockedFunction<typeof chatService.answerQuestion>

    mockedAnswerQuestion.mockRejectedValue(createAppError(502, "LLM API error: Bad Gateway"))

    const response = await request(app).post("/api/chat/query").send({ question: "Summarize all incidents" })

    expect(response.status).toBe(502)
    expect(response.body).toEqual({
      success: false,
      error: "LLM API error: Bad Gateway",
    })
  })
})

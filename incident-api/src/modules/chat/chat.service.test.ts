import { IncidentModel } from "../incidents/incident.model"
import { answerQuestion } from "./chat.service"

jest.mock("../incidents/incident.model", () => {
  const IncidentModelMock = {
    find: jest.fn(),
  }
  return { IncidentModel: IncidentModelMock }
})

type MockedIncidentModelType = {
  find: jest.Mock
}

const MockedIncidentModel = IncidentModel as unknown as MockedIncidentModelType

describe("chat service", () => {
  const originalEnv = process.env
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      LLM_API_KEY: "test-key",
      LLM_MODEL: "test-model",
      LLM_BASE_URL: "https://llm.example.test/chat",
    }
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterAll(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  const mockIncidentFindChain = (incidents: unknown[]) => {
    const leanMock = jest.fn().mockResolvedValue(incidents)
    const limitMock = jest.fn().mockReturnValue({ lean: leanMock })
    const sortMock = jest.fn().mockReturnValue({ limit: limitMock })

    MockedIncidentModel.find.mockReturnValue({ sort: sortMock })

    return { sortMock, limitMock, leanMock }
  }

  it("throws 500 when LLM_API_KEY is missing", async () => {
    delete process.env.LLM_API_KEY

    await expect(answerQuestion("Any incidents?")).rejects.toMatchObject({
      statusCode: 500,
      message: "LLM_API_KEY is not configured",
    })
  })

  it("returns first LLM answer when no tool call is provided", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "  Simple answer  " } }] }),
    })

    const result = await answerQuestion("How many incidents are there?")

    expect(result).toEqual({
      answer: "Simple answer",
      appliedFilters: null,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("returns fallback message when no tool call and empty first answer", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "   " } }] }),
    })

    const result = await answerQuestion("How many incidents are there?")

    expect(result).toEqual({
      answer: "",
      appliedFilters: null,
    })
  })

  it("executes tool flow and returns final answer with applied filters", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock
    const toolArgs = { status: "open", assignee: "Ana" }

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "",
                tool_calls: [
                  {
                    id: "tool-1",
                    type: "function",
                    function: { name: "query_incidents", arguments: JSON.stringify(toolArgs) },
                  },
                ],
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "There are 2 open incidents assigned to Ana." } }] }),
      })

    const { sortMock, limitMock, leanMock } = mockIncidentFindChain([
      {
        _id: "incident-1",
        title: "API Down",
        status: "open",
        priority: "high",
        assignee: "Ana",
        createdAt: new Date("2026-04-04T10:00:00.000Z"),
      },
    ])

    const result = await answerQuestion("How many open incidents assigned to Ana?")

    expect(MockedIncidentModel.find).toHaveBeenCalledWith({
      status: "open",
      assignee: { $regex: "Ana", $options: "i" },
    })
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
    expect(limitMock).toHaveBeenCalledWith(100)
    expect(leanMock).toHaveBeenCalledTimes(1)

    expect(result).toEqual({
      answer: "There are 2 open incidents assigned to Ana.",
      appliedFilters: toolArgs,
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("uses null appliedFilters when tool args are empty", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: "tool-1",
                    type: "function",
                    function: { name: "query_incidents", arguments: "{}" },
                  },
                ],
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "There are 0 incidents." } }] }),
      })

    mockIncidentFindChain([])

    const result = await answerQuestion("Summarize incidents")

    expect(MockedIncidentModel.find).toHaveBeenCalledWith({})
    expect(result).toEqual({
      answer: "There are 0 incidents.",
      appliedFilters: null,
    })
  })

  it("builds mongo filters for priority and date range", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock
    const toolArgs = {
      priority: "high",
      fromDate: "2026-04-01",
      toDate: "2026-04-04",
    }

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: "tool-1",
                    type: "function",
                    function: { name: "query_incidents", arguments: JSON.stringify(toolArgs) },
                  },
                ],
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "Filtered incidents summary." } }] }),
      })

    mockIncidentFindChain([])

    const result = await answerQuestion("Show high priority incidents from date range")

    expect(MockedIncidentModel.find).toHaveBeenCalledWith({
      priority: "high",
      createdAt: {
        $gte: new Date("2026-04-01"),
        $lte: new Date("2026-04-04T23:59:59.999Z"),
      },
    })
    expect(result).toEqual({
      answer: "Filtered incidents summary.",
      appliedFilters: toolArgs,
    })
  })

  it("uses default model and base URL when optional env vars are missing", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock
    delete process.env.LLM_MODEL
    delete process.env.LLM_BASE_URL

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Done" } }] }),
    })

    await answerQuestion("Quick summary")

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mistral.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    )

    const firstCallBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
    expect(firstCallBody.model).toBe("mistral-small-latest")
  })

  it("throws 502 when LLM API responds with non-OK status", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock
    fetchMock.mockResolvedValue({
      ok: false,
      text: async () => "Bad Gateway",
    })

    await expect(answerQuestion("Any incidents?")).rejects.toMatchObject({
      statusCode: 502,
      message: "LLM API error: Bad Gateway",
    })
  })

  it("throws 502 when second LLM response is empty", async () => {
    const fetchMock = global.fetch as unknown as jest.Mock

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: "tool-1",
                    type: "function",
                    function: { name: "query_incidents", arguments: "{}" },
                  },
                ],
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "   " } }] }),
      })

    mockIncidentFindChain([])

    await expect(answerQuestion("Any incidents?")).rejects.toMatchObject({
      statusCode: 502,
      message: "LLM returned an empty response",
    })
  })
})

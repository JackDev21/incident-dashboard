import { IncidentModel } from "../incidents/incident.model"
import { createIncident } from "../incidents/incident.service"
import { getDistinctMatchingAssignees, matchesAssignee, resolveCanonicalAssignee } from "../incidents/assignee.utils"
import { createAppError } from "../../middleware"
import { SYSTEM_PROMPT } from "./prompt"

// ─── Types ───────────────────────────────────────────────────────────────────

type LLMMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "tool"; tool_call_id: string; name: string; content: string }

type ToolCall = {
  id: string
  type: "function"
  function: { name: string; arguments: string }
}

type LLMResponse = {
  choices?: Array<{
    message?: {
      content?: string
      tool_calls?: ToolCall[]
    }
    finish_reason?: string
  }>
}

type IncidentFilters = {
  status?: "open" | "in progress" | "resolved"
  priority?: "low" | "medium" | "high"
  assignee?: string
  fromDate?: string
  toDate?: string
}

// ─── Tool definition ─────────────────────────────────────────────────────────

const QUERY_INCIDENTS_TOOL = {
  type: "function",
  function: {
    name: "query_incidents",
    description: "Query incidents from the database with optional filters. Call this before answering.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["open", "in progress", "resolved"],
          description: "Filter by incident status",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Filter by incident priority",
        },
        assignee: {
          type: "string",
          description: "Filter by assignee name (partial match allowed)",
        },
        fromDate: {
          type: "string",
          description: "Filter incidents created after this date (YYYY-MM-DD)",
        },
        toDate: {
          type: "string",
          description: "Filter incidents created before this date (YYYY-MM-DD)",
        },
      },
    },
  },
}

const CREATE_INCIDENT_TOOL = {
  type: "function",
  function: {
    name: "create_incident",
    description:
      "Create a new incident in the database. Call this when the user wants to report or create a new incident.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "A short, descriptive title of the incident",
        },
        description: {
          type: "string",
          description: "Detailed description of the problem",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Priority level of the incident",
        },
        assignee: {
          type: "string",
          description: "Name of the person assigned to the incident",
        },
      },
      required: ["title", "description", "priority", "assignee"],
    },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type IncidentQueryResult = {
  _id: unknown
  title: string
  status: "open" | "in progress" | "resolved"
  priority: "low" | "medium" | "high"
  assignee: string
  createdAt: Date
}

type QueryIncidentsToolResult = {
  content: string
  resolvedAssignee?: string
  matchingAssignees: string[]
}

const fetchLLM = async (body: Record<string, unknown>, apiKey: string, llmBaseUrl: string): Promise<LLMResponse> => {
  const response = await fetch(llmBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()

    // Check if it's a rate limit or capacity exceeded error
    if (response.status === 429 || errorText.includes("service_tier_capacity_exceeded")) {
      throw createAppError(429, "I'm sorry, the AI token limit has been exceeded. Please try again later.")
    }

    throw createAppError(502, `LLM API error: ${errorText}`)
  }

  return response.json() as Promise<LLMResponse>
}

const buildMongoFilter = (filters: IncidentFilters): Record<string, unknown> => {
  const mongoFilter: Record<string, unknown> = {}

  if (filters.status) mongoFilter.status = filters.status
  if (filters.priority) mongoFilter.priority = filters.priority

  if (filters.fromDate || filters.toDate) {
    const createdAtFilter: { $gte?: Date; $lte?: Date } = {}
    if (filters.fromDate) createdAtFilter.$gte = new Date(filters.fromDate)
    if (filters.toDate) createdAtFilter.$lte = new Date(`${filters.toDate}T23:59:59.999Z`)
    mongoFilter.createdAt = createdAtFilter
  }

  return mongoFilter
}

const executeQueryIncidentsTool = async (args: IncidentFilters): Promise<QueryIncidentsToolResult> => {
  const mongoFilter = buildMongoFilter({
    status: args.status,
    priority: args.priority,
    fromDate: args.fromDate,
    toDate: args.toDate,
  })
  const incidents = (await IncidentModel.find(mongoFilter).sort({ createdAt: -1 }).lean()) as IncidentQueryResult[]
  const filteredIncidents = incidents
    .filter((incident) => matchesAssignee(incident.assignee, args.assignee))
    .slice(0, 100)
  const matchingAssignees = getDistinctMatchingAssignees(
    filteredIncidents.map((incident) => incident.assignee),
    args.assignee,
  )
  const resolvedAssignee = resolveCanonicalAssignee(
    filteredIncidents.map((incident) => incident.assignee),
    args.assignee,
  )

  if (filteredIncidents.length === 0) {
    return { content: JSON.stringify({ total: 0, incidents: [] }), resolvedAssignee, matchingAssignees }
  }

  const data = filteredIncidents.map((i) => ({
    id: String(i._id),
    title: i.title,
    status: i.status,
    priority: i.priority,
    assignee: i.assignee,
    createdAt: i.createdAt,
  }))

  return {
    content: JSON.stringify({ total: filteredIncidents.length, incidents: data }),
    resolvedAssignee,
    matchingAssignees,
  }
}

const executeCreateIncidentTool = async (args: {
  title: string
  description: string
  priority: string
  assignee: string
}): Promise<{ content: string }> => {
  try {
    const incident = await createIncident(args)
    return {
      content: JSON.stringify({
        success: true,
        message: `Incident created successfully with ID ${incident._id}`,
        incident,
      }),
    }
  } catch (error: any) {
    return {
      content: JSON.stringify({
        success: false,
        message: error.message || "Failed to create incident",
      }),
    }
  }
}

const buildAmbiguousAssigneeResponse = (matchingAssignees: string[]): string => {
  const options = matchingAssignees.map((assignee) => `- ${assignee}`).join("\n")

  return `He encontrado varias personas que coinciden con ese nombre:\n\n${options}\n\n¿A cuál de ellas te refieres?`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export const answerQuestion = async (
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<{ answer: string; appliedFilters: IncidentFilters | null }> => {
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || "mistral-small-latest"
  const llmBaseUrl = process.env.LLM_BASE_URL || "https://api.mistral.ai/v1/chat/completions"

  if (!apiKey) {
    throw createAppError(500, "LLM_API_KEY is not configured")
  }

  const messages: LLMMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: question },
  ]

  // Call 1: LLM decides which tool to call and with what arguments
  const firstResponse = await fetchLLM(
    { model, temperature: 0.1, messages, tools: [QUERY_INCIDENTS_TOOL, CREATE_INCIDENT_TOOL], tool_choice: "auto" },
    apiKey,
    llmBaseUrl,
  )

  const firstMessage = firstResponse.choices?.[0]?.message
  const toolCall = firstMessage?.tool_calls?.[0]

  if (!toolCall) {
    return { answer: firstMessage?.content?.trim() ?? "No response generated.", appliedFilters: null }
  }

  // Execute the tool on our backend
  const toolArgs = JSON.parse(toolCall.function.arguments)
  let toolResult: { content: string; resolvedAssignee?: string; matchingAssignees?: string[] }

  if (toolCall.function.name === "query_incidents") {
    toolResult = await executeQueryIncidentsTool(toolArgs as IncidentFilters)
  } else if (toolCall.function.name === "create_incident") {
    toolResult = await executeCreateIncidentTool(toolArgs)
  } else {
    throw createAppError(500, `Unknown tool called: ${toolCall.function.name}`)
  }

  if (
    toolCall.function.name === "query_incidents" &&
    (toolArgs as IncidentFilters).assignee &&
    toolResult.matchingAssignees &&
    toolResult.matchingAssignees.length > 1
  ) {
    return { answer: buildAmbiguousAssigneeResponse(toolResult.matchingAssignees), appliedFilters: null }
  }

  // Call 2: LLM generates final answer using tool result
  const secondResponse = await fetchLLM(
    {
      model,
      temperature: 0.2,
      messages: [
        ...messages,
        { role: "assistant", content: firstMessage?.content ?? "", tool_calls: [toolCall] },
        { role: "tool", tool_call_id: toolCall.id, name: toolCall.function.name, content: toolResult.content },
      ],
    },
    apiKey,
    llmBaseUrl,
  )

  const answer = secondResponse.choices?.[0]?.message?.content?.trim()
  if (!answer) {
    throw createAppError(502, "LLM returned an empty response")
  }

  const appliedFilters =
    toolCall.function.name === "query_incidents" && Object.keys(toolArgs).length > 0
      ? {
          ...toolArgs,
          ...(toolResult.resolvedAssignee ? { assignee: toolResult.resolvedAssignee } : {}),
        }
      : null
  return { answer, appliedFilters }
}

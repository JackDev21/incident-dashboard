import { createAppError } from "../../../middleware/http/errorHandler"
import { IncidentModel, incidentService } from "../../incidents"
import {
  getDistinctMatchingAssignees,
  matchesAssignee,
  resolveCanonicalAssignee,
  exactMatchesAssignee,
  normalizeAssigneeText,
} from "../../incidents/utils/assignee"
import { IncidentPriority, IncidentStatus } from "../../incidents/types/incidentTypes"
import { SYSTEM_PROMPT } from "../utils/prompt"

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
  title?: string
  fromDate?: string
  toDate?: string
}

type ChatAction = "created" | "updated" | "deleted" | null

// ─── Tool definition ─────────────────────────────────────────────────────────

const QUERY_INCIDENTS_TOOL = {
  type: "function",
  function: {
    name: "query_incidents",
    description:
      "Query incidents from the database with optional filters. Call this before answering or before deleting/updating an incident to find the correct ID.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Filter by incident title (partial match allowed)",
        },
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

const UPDATE_INCIDENT_TOOL = {
  type: "function",
  function: {
    name: "update_incident",
    description:
      "Update an existing incident in the database. Use this to change the title, description, status, priority, or assignee of an incident.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the incident to update",
        },
        title: {
          type: "string",
          description: "New title for the incident",
        },
        description: {
          type: "string",
          description: "New description for the incident",
        },
        status: {
          type: "string",
          enum: ["open", "in progress", "resolved"],
          description: "New status of the incident",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "New priority of the incident",
        },
        assignee: {
          type: "string",
          description: "New assignee name for the incident",
        },
      },
      required: ["id"],
    },
  },
}

const DELETE_INCIDENT_TOOL = {
  type: "function",
  function: {
    name: "delete_incident",
    description:
      "Permanently delete an incident from the database. Use this when the user explicitly asks to remove or delete a specific incident.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the incident to delete",
        },
      },
      required: ["id"],
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

  if (filters.title) {
    mongoFilter.title = { $regex: filters.title, $options: "i" }
  }
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
  const useExact = (args as any).__exactAssigneeSelection === true

  const allFiltered = incidents.filter((incident) =>
    useExact
      ? exactMatchesAssignee(incident.assignee, args.assignee)
      : matchesAssignee(incident.assignee, args.assignee),
  )
  const filteredIncidents = allFiltered.slice(0, 100)

  let matchingAssignees: string[]
  let resolvedAssignee: string | undefined

  if (useExact) {
    matchingAssignees = Array.from(new Set(filteredIncidents.map((incident) => incident.assignee)))
    resolvedAssignee = matchingAssignees.length === 1 ? matchingAssignees[0] : undefined
  } else {
    matchingAssignees = getDistinctMatchingAssignees(
      filteredIncidents.map((incident) => incident.assignee),
      args.assignee,
    )
    resolvedAssignee = resolveCanonicalAssignee(
      filteredIncidents.map((incident) => incident.assignee),
      args.assignee,
    )
  }

  if (filteredIncidents.length === 0) {
    return {
      content: "No incidents found matching the criteria.",
      resolvedAssignee,
      matchingAssignees,
    }
  }

  const formattedIncidents = filteredIncidents
    .map((i) => {
      const id = String(i._id)
      const createdDate = new Date(i.createdAt).toISOString().split("T")[0]
      // Format: [#Title](/incidents/{id}) | Estado: status | Prioridad: priority | Asignada a: assignee | Creación: date
      return `[#${i.title}](/incidents/${id}) | Estado: ${i.status} | Prioridad: ${i.priority} | Asignada a: ${i.assignee} | Creación: ${createdDate}`
    })
    .join("\n")

  const ambiguityPrefix =
    matchingAssignees.length > 1
      ? `AMBIGUOUS_ASSIGNEE: The search matched ${matchingAssignees.length} distinct people: ${matchingAssignees.map((n) => `"${n}"`).join(", ")}. Do NOT show the results below. Ask the user which specific person they mean and list only those names.\n\n`
      : ""

  const summaryContent = `${ambiguityPrefix}Found ${filteredIncidents.length} incident(s):\n\n${formattedIncidents}`

  return {
    content: summaryContent,
    resolvedAssignee,
    matchingAssignees,
  }
}

const executeCreateIncidentTool = async (
  args: {
    title: string
    description: string
    priority: string
    assignee: string
  },
  creatorId?: string,
): Promise<{ content: string }> => {
  try {
    const incident = await incidentService.createIncident({ ...args, creatorId }, undefined)
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

const executeUpdateIncidentTool = async (args: {
  id: string
  title?: string
  description?: string
  status?: IncidentStatus
  priority?: IncidentPriority
  assignee?: string
}): Promise<{ content: string }> => {
  try {
    const incident = await incidentService.updateIncident(args.id, {
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      assignee: args.assignee,
    })
    return {
      content: JSON.stringify({
        success: true,
        message: `Incident ${args.id} updated successfully`,
        incident,
      }),
    }
  } catch (error: any) {
    return {
      content: JSON.stringify({
        success: false,
        message: error.message || "Failed to update incident",
      }),
    }
  }
}

const executeDeleteIncidentTool = async (args: { id: string }): Promise<{ content: string }> => {
  try {
    await incidentService.deleteIncident(args.id)
    return {
      content: JSON.stringify({
        success: true,
        message: `Incident ${args.id} deleted successfully`,
      }),
    }
  } catch (error: any) {
    return {
      content: JSON.stringify({
        success: false,
        message: error.message || "Failed to delete incident",
      }),
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export const answerQuestion = async (
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  creatorId?: string,
  selection?: { field: string; value: string },
  previousFilters?: IncidentFilters | null,
): Promise<{ answer: string; appliedFilters: IncidentFilters | null; action: ChatAction }> => {
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
    {
      model,
      temperature: 0.1,
      messages,
      tools: [QUERY_INCIDENTS_TOOL, CREATE_INCIDENT_TOOL, UPDATE_INCIDENT_TOOL, DELETE_INCIDENT_TOOL],
      tool_choice: "auto",
    },
    apiKey,
    llmBaseUrl,
  )

  const firstMessage = firstResponse.choices?.[0]?.message
  const toolCall = firstMessage?.tool_calls?.[0]

  if (!toolCall) {
    return { answer: firstMessage?.content?.trim() ?? "No response generated.", appliedFilters: null, action: null }
  }

  // Execute the tool on our backend
  let toolArgs: any = JSON.parse(toolCall.function.arguments)

  // Merge previous chat filters into the tool args for follow-up queries so the
  // conversation maintains context (e.g., user first requested status=open+priority=low,
  // then "solo muestre las de Elena" should keep the previous filters).
  if (toolCall.function.name === "query_incidents" && previousFilters) {
    try {
      toolArgs = {
        ...(previousFilters.status ? { status: previousFilters.status } : {}),
        ...(previousFilters.priority ? { priority: previousFilters.priority } : {}),
        ...(previousFilters.assignee ? { assignee: previousFilters.assignee } : {}),
        ...(previousFilters.fromDate ? { fromDate: previousFilters.fromDate } : {}),
        ...(previousFilters.toDate ? { toDate: previousFilters.toDate } : {}),
        ...toolArgs,
      }
    } catch (err) {
      // ignore merge errors
    }
  }
  // If the LLM provided a `title` but no `assignee`, and that title text matches one or more
  // known assignees, ask the user to clarify instead of guessing whether they meant a title
  // search or an assignee filter.
  if (toolCall.function.name === "query_incidents" && !toolArgs.assignee && toolArgs.title) {
    try {
      const candidates = await incidentService.getUniqueAssignees()
      const matches = getDistinctMatchingAssignees(candidates, String(toolArgs.title))
      if (matches.length > 0) {
        // Let the LLM generate a natural clarification question instead of a deterministic string.
        const matchListText = matches.map((n) => `"${n}"`).join(", ")
        const userClarifyPrompt = `The text \"${toolArgs.title}\" might refer to an incident title or to the name of an assignee (${matchListText}). Ask ONE short clarification question to the user, preferably in the user's language, asking whether they want to search by title (reply \"title\") or by assignee (reply \"assignee: <name>\"). Do NOT call any tools or include extra information.`

        const clarifyResp = await fetchLLM(
          {
            model,
            temperature: 0.0,
            messages: [...messages, { role: "user", content: userClarifyPrompt }],
          },
          apiKey,
          llmBaseUrl,
        )

        const clarification = clarifyResp.choices?.[0]?.message?.content?.trim() ??
          `Do you want to search by title \"${toolArgs.title}\" or by assignee ${matchListText}? Reply with \"title\" or \"assignee: <name>\".`

        return { answer: clarification, appliedFilters: null, action: null }
      }
    } catch (err) {
      // ignore errors and continue
    }
  }
  if (selection && toolCall.function.name === "query_incidents") {
    try {
      if (selection.field === "assignee" && typeof selection.value === "string" && selection.value.trim()) {
        toolArgs = { ...toolArgs, assignee: String(selection.value).trim(), __exactAssigneeSelection: true }
      }
    } catch (err) {
      // ignore malformed selection
    }
  }
  let toolResult: { content: string; resolvedAssignee?: string; matchingAssignees?: string[] }
  let action: ChatAction = null

  if (toolCall.function.name === "query_incidents") {
    toolResult = await executeQueryIncidentsTool(toolArgs as IncidentFilters)
  } else if (toolCall.function.name === "create_incident") {
    toolResult = await executeCreateIncidentTool(toolArgs, creatorId)
    action = "created"
  } else if (toolCall.function.name === "update_incident") {
    toolResult = await executeUpdateIncidentTool(toolArgs)
    action = "updated"
  } else if (toolCall.function.name === "delete_incident") {
    toolResult = await executeDeleteIncidentTool(toolArgs)
    action = "deleted"
  } else {
    throw createAppError(500, `Unknown tool called: ${toolCall.function.name}`)
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

  // Do not apply filters to the dashboard when the assignee is ambiguous
  // (multiple candidates found). In that case the LLM should ask the user to clarify,
  // and we must not pre-filter the dashboard until the user picks one.
  const isAmbiguous =
    toolCall.function.name === "query_incidents" && toolArgs.assignee && (toolResult.matchingAssignees?.length ?? 0) > 1

  const appliedFilters =
    toolCall.function.name === "query_incidents" && Object.keys(toolArgs).length > 0 && !isAmbiguous
      ? (() => {
          const base: IncidentFilters = {}
          if (toolArgs.status) base.status = toolArgs.status
          if (toolArgs.priority) base.priority = toolArgs.priority
          if (toolArgs.title) base.title = toolArgs.title
          if (toolArgs.fromDate) base.fromDate = toolArgs.fromDate
          if (toolArgs.toDate) base.toDate = toolArgs.toDate

          // Include assignee only when the tool result has a resolved or matching assignee
          if (toolResult.resolvedAssignee) {
            base.assignee = toolResult.resolvedAssignee
          } else if (
            toolArgs.assignee &&
            Array.isArray(toolResult.matchingAssignees) &&
            toolResult.matchingAssignees.length > 0
          ) {
            base.assignee = toolResult.matchingAssignees.length === 1 ? toolResult.matchingAssignees[0] : toolArgs.assignee
          }

          return Object.keys(base).length > 0 ? base : null
        })()
      : null
  return { answer, appliedFilters, action }
}

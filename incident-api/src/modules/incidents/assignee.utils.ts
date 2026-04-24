export const normalizeAssigneeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim()

// Partial match — used in chatService for broad candidate search
export const matchesAssignee = (incidentAssignee: string, requestedAssignee?: string): boolean => {
  if (!requestedAssignee) return true

  return normalizeAssigneeText(incidentAssignee).includes(normalizeAssigneeText(requestedAssignee))
}

// Exact match — used in incident.service for dashboard filtering
export const exactMatchesAssignee = (incidentAssignee: string, requestedAssignee?: string): boolean => {
  if (!requestedAssignee) return true

  return normalizeAssigneeText(incidentAssignee) === normalizeAssigneeText(requestedAssignee)
}

export const getDistinctMatchingAssignees = (assignees: string[], requestedAssignee?: string): string[] => {
  if (!requestedAssignee) return []

  return Array.from(new Set(assignees.filter((assignee) => matchesAssignee(assignee, requestedAssignee))))
}

export const resolveCanonicalAssignee = (assignees: string[], requestedAssignee?: string): string | undefined => {
  if (!requestedAssignee) return undefined

  const distinctMatches = getDistinctMatchingAssignees(assignees, requestedAssignee)

  // Return the canonical name only when there is exactly one match (unambiguous).
  // Return undefined when there are 0 or >1 matches so the caller knows the query is ambiguous.
  return distinctMatches.length === 1 ? distinctMatches[0] : undefined
}
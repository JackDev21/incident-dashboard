export const normalizeAssigneeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim()

export const matchesAssignee = (incidentAssignee: string, requestedAssignee?: string): boolean => {
  if (!requestedAssignee) return true

  return normalizeAssigneeText(incidentAssignee).includes(normalizeAssigneeText(requestedAssignee))
}

export const getDistinctMatchingAssignees = (assignees: string[], requestedAssignee?: string): string[] => {
  if (!requestedAssignee) return []

  return Array.from(new Set(assignees.filter((assignee) => matchesAssignee(assignee, requestedAssignee))))
}

export const resolveCanonicalAssignee = (assignees: string[], requestedAssignee?: string): string | undefined => {
  if (!requestedAssignee) return undefined

  const distinctMatches = getDistinctMatchingAssignees(assignees, requestedAssignee)

  return distinctMatches.length === 1 ? distinctMatches[0] : requestedAssignee
}
/**
 * Groups conversations by their updatedAt timestamp into human-readable categories:
 * Today, Yesterday, Last 7 days, Last 30 days, or Older.
 * 
 * @param {Array} conversations - Array of conversation objects
 * @returns {Object} - Object with group names as keys and arrays of conversations as values
 */
export function groupConversations(conversations) {
  if (!conversations || conversations.length === 0) return {}

  const now = Date.now()
  const oneDayMs = 86400000
  const oneWeekMs = 7 * oneDayMs
  const oneMonthMs = 30 * oneDayMs

  const groups = {}

  for (const conv of conversations) {
    const age = now - conv.updatedAt
    let group

    if (age < oneDayMs) {
      group = 'Today'
    } else if (age < 2 * oneDayMs) {
      group = 'Yesterday'
    } else if (age < oneWeekMs) {
      group = 'Last 7 days'
    } else if (age < oneMonthMs) {
      group = 'Last 30 days'
    } else {
      group = 'Older'
    }

    if (!groups[group]) groups[group] = []
    groups[group].push(conv)
  }

  // Sort within groups: newest first
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  // Define the order of groups for consistent rendering
  const orderedGroups = {}
  const groupOrder = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Older']
  
  for (const g of groupOrder) {
    if (groups[g] && groups[g].length > 0) {
      orderedGroups[g] = groups[g]
    }
  }

  return orderedGroups
}

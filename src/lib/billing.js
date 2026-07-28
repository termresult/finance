/** Client-side formatting helpers only — billing mutations live on the API. */

export function dueDateFromDays(days = 14) {
  const date = new Date()
  date.setDate(date.getDate() + Number(days || 14))
  return date.toISOString().slice(0, 10)
}

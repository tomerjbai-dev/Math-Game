// A valid answer is a whole number between 1 and 100 (PRD Edge Cases)
export const MIN_ANSWER = 1
export const MAX_ANSWER = 100

export function parseAnswer(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const value = Number(trimmed)
  return value >= MIN_ANSWER && value <= MAX_ANSWER ? value : null
}

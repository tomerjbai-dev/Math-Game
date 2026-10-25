// Canonical id "a-b" with a <= b; 3×7 and 7×3 share the id "3-7"
export type ExerciseId = string
// Display order as shown to the child, e.g. "7-3"; canonical id = sorted pair (ADR-1)
export type DisplayPair = string

// Factors run 2..10: exercises with a factor of 1 are left out by user request
export const MIN_FACTOR = 2
export const TOTAL_EXERCISES = 45

function buildCatalog(): ExerciseId[] {
  const ids: ExerciseId[] = []
  for (let a = MIN_FACTOR; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      ids.push(`${a}-${b}`)
    }
  }
  return ids
}

export const ALL_EXERCISE_IDS: readonly ExerciseId[] = buildCatalog()

export function parsePair(pair: DisplayPair): [number, number] {
  const [a, b] = pair.split('-').map(Number)
  return [a, b]
}

export function canonicalId(pair: DisplayPair): ExerciseId {
  const [a, b] = parsePair(pair)
  return a <= b ? `${a}-${b}` : `${b}-${a}`
}

export function product(pair: DisplayPair): number {
  const [a, b] = parsePair(pair)
  return a * b
}

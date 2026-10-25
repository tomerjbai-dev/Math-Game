import type { RandomInt } from '../game/random.ts'

// Deterministic source: cycles through 0,1,2,... modulo the requested range
export function sequenceRandom(): RandomInt {
  let counter = 0
  return (maxExclusive) => counter++ % maxExclusive
}

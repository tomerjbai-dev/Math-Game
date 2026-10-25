import type { RandomInt } from '../game/random.ts'
import { createInitialState, type GameState } from '../game/gameState.ts'

// Deterministic source: cycles through 0,1,2,... modulo the requested range
export function sequenceRandom(): RandomInt {
  let counter = 0
  return (maxExclusive) => counter++ % maxExclusive
}

// A round partway through: the first `index` exercises already solved
export function stateAt(index: number, bestScore = index): GameState {
  const state = createInitialState(sequenceRandom())
  return { bestScore, round: { ...state.round, index, score: index } }
}

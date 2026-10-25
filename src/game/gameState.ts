import { ALL_EXERCISE_IDS, TOTAL_EXERCISES, parsePair, product, type DisplayPair } from './exercises.ts'
import { cryptoRandomInt, shuffle, type RandomInt } from './random.ts'

// Shape follows SavedGame in ARCHITECTURE 2.3; persisted by storage.ts
export type RoundStatus = 'playing' | 'lost' | 'won'

export interface Round {
  status: RoundStatus
  order: DisplayPair[]
  index: number
  mistakesOnCurrent: 0 | 1
  score: number
}

export interface GameState {
  bestScore: number
  round: Round
}

// newRound carries a pre-shuffled round so the reducer stays free of randomness
export type GameAction = { type: 'answer'; value: number } | { type: 'newRound'; round: Round }

export function createRound(randomInt: RandomInt = cryptoRandomInt): Round {
  const order = shuffle(ALL_EXERCISE_IDS, randomInt).map((id) => {
    const [a, b] = parsePair(id)
    return randomInt(2) === 0 ? `${a}-${b}` : `${b}-${a}`
  })
  return { status: 'playing', order, index: 0, mistakesOnCurrent: 0, score: 0 }
}

export function createInitialState(randomInt: RandomInt = cryptoRandomInt): GameState {
  return { bestScore: 0, round: createRound(randomInt) }
}

export function currentPair(state: GameState): DisplayPair | null {
  const { round } = state
  return round.status === 'playing' ? round.order[round.index] : null
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'answer': {
      const pair = currentPair(state)
      if (pair === null) return state
      const { round } = state

      if (action.value === product(pair)) {
        const score = round.score + 1
        return {
          bestScore: Math.max(state.bestScore, score),
          round: {
            ...round,
            status: score === TOTAL_EXERCISES ? 'won' : 'playing',
            index: round.index + 1,
            mistakesOnCurrent: 0,
            score,
          },
        }
      }

      if (round.mistakesOnCurrent === 0) {
        return { ...state, round: { ...round, mistakesOnCurrent: 1 } }
      }
      return { ...state, round: { ...round, status: 'lost' } }
    }

    // Resets the round only; the personal best is kept (PRD FR-04)
    case 'newRound':
      return { ...state, round: action.round }
  }
}

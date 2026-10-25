import { describe, expect, it } from 'vitest'
import { ALL_EXERCISE_IDS, canonicalId, parsePair, product } from './exercises.ts'
import { createInitialState, createRound, currentPair, gameReducer, type GameState } from './gameState.ts'
import { sequenceRandom } from '../test/helpers.ts'

function answerCorrectly(state: GameState): GameState {
  return gameReducer(state, { type: 'answer', value: product(currentPair(state)!) })
}

function answerWrongly(state: GameState): GameState {
  return gameReducer(state, { type: 'answer', value: product(currentPair(state)!) + 1 })
}

describe('createRound', () => {
  it('orders all 45 canonical exercises exactly once', () => {
    const round = createRound()
    expect(round.order).toHaveLength(45)
    expect(new Set(round.order.map(canonicalId))).toEqual(new Set(ALL_EXERCISE_IDS))
    expect(round).toMatchObject({ status: 'playing', index: 0, mistakesOnCurrent: 0, score: 0 })
  })

  it('randomizes the displayed factor order per exercise', () => {
    const order = createRound(sequenceRandom()).order.filter((pair) => {
      const [a, b] = parsePair(pair)
      return a !== b
    })
    const swapped = order.filter((pair) => pair !== canonicalId(pair))
    expect(swapped.length).toBeGreaterThan(0)
    expect(swapped.length).toBeLessThan(order.length)
  })
})

describe('gameReducer', () => {
  it('a correct answer advances to a new exercise and adds one point', () => {
    const start = createInitialState()
    const next = answerCorrectly(start)
    expect(next.round.index).toBe(1)
    expect(next.round.score).toBe(1)
    expect(next.round.mistakesOnCurrent).toBe(0)
    expect(canonicalId(currentPair(next)!)).not.toBe(canonicalId(currentPair(start)!))
  })

  it('never repeats a solved exercise and ends in a win after 45', () => {
    let state = createInitialState()
    const seen = new Set<string>()
    for (let i = 0; i < 45; i++) {
      const id = canonicalId(currentPair(state)!)
      expect(seen.has(id)).toBe(false)
      seen.add(id)
      state = answerCorrectly(state)
    }
    expect(seen.size).toBe(45)
    expect(state.round.status).toBe('won')
    expect(state.round.score).toBe(45)
    expect(currentPair(state)).toBeNull()
  })

  it('a first mistake keeps the same exercise with one attempt left', () => {
    const start = createInitialState()
    const next = answerWrongly(start)
    expect(next.round.index).toBe(0)
    expect(next.round.mistakesOnCurrent).toBe(1)
    expect(next.round.status).toBe('playing')
    expect(currentPair(next)).toBe(currentPair(start))
  })

  it('a correct answer after one mistake resets the mistake count', () => {
    const next = answerCorrectly(answerWrongly(createInitialState()))
    expect(next.round.mistakesOnCurrent).toBe(0)
    expect(next.round.score).toBe(1)
  })

  it('a second mistake ends the round without advancing', () => {
    const state = answerWrongly(answerWrongly(answerCorrectly(createInitialState())))
    expect(state.round.status).toBe('lost')
    expect(state.round.index).toBe(1)
    expect(state.round.score).toBe(1)
  })

  it('ignores answers once the round has ended', () => {
    const lost = answerWrongly(answerWrongly(createInitialState()))
    expect(gameReducer(lost, { type: 'answer', value: 1 })).toBe(lost)
  })
})

describe('scoring and new rounds', () => {
  it('a first mistake neither adds nor removes points', () => {
    const state = answerWrongly(answerCorrectly(answerCorrectly(createInitialState())))
    expect(state.round.score).toBe(2)
    expect(state.round.index).toBe(2)
  })

  it('the personal best rises with the score and never drops', () => {
    let state = answerCorrectly(answerCorrectly(answerCorrectly(createInitialState())))
    expect(state.bestScore).toBe(3)
    state = gameReducer(state, { type: 'newRound', round: createRound() })
    state = answerCorrectly(state)
    expect(state.round.score).toBe(1)
    expect(state.bestScore).toBe(3)
  })

  it('newRound resets score, attempts and solved list but keeps the best', () => {
    const lost = answerWrongly(answerWrongly(answerCorrectly(answerCorrectly(createInitialState()))))
    const round = createRound(sequenceRandom())
    const next = gameReducer(lost, { type: 'newRound', round })
    expect(next.round).toEqual({ status: 'playing', order: round.order, index: 0, mistakesOnCurrent: 0, score: 0 })
    expect(next.bestScore).toBe(2)
  })

  it('newRound also works after a win, and answers after a win change nothing', () => {
    let state = createInitialState()
    for (let i = 0; i < 45; i++) state = answerCorrectly(state)
    expect(state.bestScore).toBe(45)
    expect(gameReducer(state, { type: 'answer', value: 1 })).toBe(state)
    const next = gameReducer(state, { type: 'newRound', round: createRound() })
    expect(next.round.status).toBe('playing')
    expect(next.round.score).toBe(0)
    expect(next.bestScore).toBe(45)
  })
})

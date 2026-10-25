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
  it('orders all 55 canonical exercises exactly once', () => {
    const round = createRound()
    expect(round.order).toHaveLength(55)
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

  it('never repeats a solved exercise and ends in a win after 55', () => {
    let state = createInitialState()
    const seen = new Set<string>()
    for (let i = 0; i < 55; i++) {
      const id = canonicalId(currentPair(state)!)
      expect(seen.has(id)).toBe(false)
      seen.add(id)
      state = answerCorrectly(state)
    }
    expect(seen.size).toBe(55)
    expect(state.round.status).toBe('won')
    expect(state.round.score).toBe(55)
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

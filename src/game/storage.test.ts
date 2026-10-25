import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, loadGame, parseSavedGame, saveGame } from './storage.ts'
import { TOTAL_EXERCISES } from './exercises.ts'
import type { GameState } from './gameState.ts'
import { stateAt } from '../test/helpers.ts'

function serialize(state: GameState, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({ schemaVersion: 1, ...state, ...extra })
}

function withRound(patch: Partial<GameState['round']>, bestScore?: number): string {
  const state = stateAt(5, 10)
  return serialize({ bestScore: bestScore ?? state.bestScore, round: { ...state.round, ...patch } })
}

describe('saveGame / loadGame', () => {
  it.each<[string, GameState]>([
    ['mid-round', stateAt(7, 12)],
    ['after a first mistake', { ...stateAt(3), round: { ...stateAt(3).round, mistakesOnCurrent: 1 } }],
    ['lost', { ...stateAt(4), round: { ...stateAt(4).round, status: 'lost', mistakesOnCurrent: 1 } }],
    ['won', { ...stateAt(TOTAL_EXERCISES), round: { ...stateAt(TOTAL_EXERCISES).round, status: 'won' } }],
  ])('round-trips a %s game', (_, state) => {
    expect(saveGame(localStorage, state)).toBe(true)
    expect(loadGame(localStorage)).toEqual(state)
  })

  it('stores the schema version under the agreed key', () => {
    saveGame(localStorage, stateAt(2))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).schemaVersion).toBe(1)
  })

  it('returns null when nothing is saved', () => {
    expect(loadGame(localStorage)).toBeNull()
  })

  it('handles missing or throwing storage without errors', () => {
    expect(loadGame(null)).toBeNull()
    expect(saveGame(null, stateAt(1))).toBe(false)

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(loadGame(localStorage)).toBeNull()
    expect(saveGame(localStorage, stateAt(1))).toBe(false)
  })
})

describe('parseSavedGame validation', () => {
  const valid = stateAt(5, 10)
  const swapped = [...valid.round.order]
  // Replace one pair with the reversed form of another: same canonical id twice
  const [a, b] = swapped[0].split('-')
  swapped[1] = `${b}-${a}`

  it.each<[string, string]>([
    ['broken JSON', '{not json'],
    ['a non-object', '42'],
    ['a missing schema version', JSON.stringify(valid)],
    ['a future schema version', serialize(valid, { schemaVersion: 2 })],
    ['a short order', withRound({ order: valid.round.order.slice(1) })],
    ['a duplicate exercise', withRound({ order: swapped })],
    ['a factor of 1', withRound({ order: ['1-5', ...valid.round.order.slice(1)] })],
    ['a factor of 11', withRound({ order: ['11-5', ...valid.round.order.slice(1)] })],
    ['a non-string pair', withRound({ order: [35 as unknown as string, ...valid.round.order.slice(1)] })],
    ['a negative index', withRound({ index: -1, score: -1 })],
    ['an index above 45', withRound({ index: 46, score: 46 }, 45)],
    ['a score different from the index', withRound({ score: 4 })],
    ['two mistakes', withRound({ mistakesOnCurrent: 2 as 1 })],
    ['an unknown status', withRound({ status: 'paused' as 'playing' })],
    ['won before 45', withRound({ status: 'won' })],
    ['playing at 45', withRound({ index: 45, score: 45 }, 45)],
    ['a best score below the score', withRound({}, 3)],
    ['a best score above 45', withRound({}, 46)],
  ])('rejects %s', (_, raw) => {
    expect(parseSavedGame(raw)).toBeNull()
  })

  it('accepts a valid game', () => {
    expect(parseSavedGame(serialize(valid))).toEqual(valid)
  })
})

import { ALL_EXERCISE_IDS, MIN_FACTOR, TOTAL_EXERCISES, canonicalId } from './exercises.ts'
import type { GameState, Round, RoundStatus } from './gameState.ts'

// SavedGame schema from ARCHITECTURE 2.3 (ADR-2)
export const STORAGE_KEY = 'multiplication-champions:v1'
export const SCHEMA_VERSION = 1

export interface SavedGame extends GameState {
  schemaVersion: typeof SCHEMA_VERSION
}

const STATUSES: readonly RoundStatus[] = ['playing', 'lost', 'won']
const PAIR_PATTERN = /^(\d+)-(\d+)$/

// window.localStorage itself can throw (blocked site data, some private modes)
export function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max
}

function isFactor(text: string): boolean {
  return isIntInRange(Number(text), MIN_FACTOR, 10)
}

function isValidOrder(order: unknown): order is string[] {
  if (!Array.isArray(order) || order.length !== TOTAL_EXERCISES) return false
  for (const pair of order) {
    if (typeof pair !== 'string') return false
    const match = PAIR_PATTERN.exec(pair)
    if (!match || !isFactor(match[1]) || !isFactor(match[2])) return false
  }
  // 45 valid pairs with unique canonical ids cover the whole catalog exactly once
  return new Set(order.map(canonicalId)).size === ALL_EXERCISE_IDS.length
}

function isValidRound(round: unknown): round is Round {
  if (typeof round !== 'object' || round === null) return false
  const { status, order, index, mistakesOnCurrent, score } = round as Record<string, unknown>
  if (!STATUSES.includes(status as RoundStatus)) return false
  if (!isValidOrder(order)) return false
  if (!isIntInRange(index, 0, TOTAL_EXERCISES) || score !== index) return false
  if (mistakesOnCurrent !== 0 && mistakesOnCurrent !== 1) return false
  if (status === 'won') return index === TOTAL_EXERCISES && mistakesOnCurrent === 0
  return index < TOTAL_EXERCISES
}

export function parseSavedGame(raw: string | null): GameState | null {
  if (raw === null) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const { schemaVersion, bestScore, round } = data as Record<string, unknown>
  if (schemaVersion !== SCHEMA_VERSION) return null
  if (!isIntInRange(bestScore, 0, TOTAL_EXERCISES) || !isValidRound(round)) return null
  // The best is updated on every correct answer, so it can never trail the score
  if (bestScore < round.score) return null

  const { status, order, index, mistakesOnCurrent, score } = round
  return { bestScore, round: { status, order: [...order], index, mistakesOnCurrent, score } }
}

export function loadGame(storage: Storage | null): GameState | null {
  if (!storage) return null
  try {
    return parseSavedGame(storage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

// Returns false when the data could not be written (blocked storage, full quota)
export function saveGame(storage: Storage | null, state: GameState): boolean {
  if (!storage) return false
  const saved: SavedGame = { schemaVersion: SCHEMA_VERSION, ...state }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(saved))
    return true
  } catch {
    return false
  }
}

import { describe, expect, it } from 'vitest'
import { ALL_EXERCISE_IDS, TOTAL_EXERCISES, canonicalId, parsePair, product } from './exercises.ts'

describe('exercise catalog', () => {
  it('contains exactly 55 unique canonical pairs within 1..10', () => {
    expect(ALL_EXERCISE_IDS).toHaveLength(TOTAL_EXERCISES)
    expect(new Set(ALL_EXERCISE_IDS).size).toBe(55)
    for (const id of ALL_EXERCISE_IDS) {
      const [a, b] = parsePair(id)
      expect(a).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(10)
      expect(a).toBeLessThanOrEqual(b)
    }
  })

  it('treats swapped factors as the same exercise', () => {
    expect(canonicalId('7-3')).toBe(canonicalId('3-7'))
    expect(canonicalId('5-4')).toBe('4-5')
    expect(ALL_EXERCISE_IDS).toContain('3-7')
    expect(ALL_EXERCISE_IDS).not.toContain('7-3')
  })

  it('keeps pairs with the same product as different exercises', () => {
    expect(product('5-4')).toBe(product('2-10'))
    expect(canonicalId('5-4')).not.toBe(canonicalId('2-10'))
    expect(ALL_EXERCISE_IDS).toContain('4-5')
    expect(ALL_EXERCISE_IDS).toContain('2-10')
  })
})

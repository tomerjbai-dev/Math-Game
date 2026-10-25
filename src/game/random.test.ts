import { describe, expect, it } from 'vitest'
import { cryptoRandomInt, shuffle } from './random.ts'

describe('random helpers', () => {
  it('cryptoRandomInt stays within range', () => {
    for (let i = 0; i < 1000; i++) {
      const value = cryptoRandomInt(7)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(7)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('shuffle returns a permutation without mutating the input', () => {
    const input = Array.from({ length: 20 }, (_, i) => i)
    const copy = [...input]
    const result = shuffle(input, cryptoRandomInt)
    expect(input).toEqual(copy)
    expect([...result].sort((a, b) => a - b)).toEqual(copy)
  })
})

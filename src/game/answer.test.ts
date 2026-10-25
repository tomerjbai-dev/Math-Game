import { describe, expect, it } from 'vitest'
import { parseAnswer } from './answer.ts'

describe('parseAnswer', () => {
  it.each([
    ['1', 1],
    ['42', 42],
    ['100', 100],
    [' 7 ', 7],
  ])('accepts %j', (text, expected) => {
    expect(parseAnswer(text)).toBe(expected)
  })

  it.each(['', '   ', '0', '101', '150', 'abc', '3.5', '-4', '1e2', '4 2'])('rejects %j', (text) => {
    expect(parseAnswer(text)).toBeNull()
  })
})

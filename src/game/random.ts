// Returns an integer in 0..maxExclusive-1
export type RandomInt = (maxExclusive: number) => number

const UINT32_RANGE = 2 ** 32

// Rejection sampling avoids modulo bias (ARCHITECTURE 2.3)
export const cryptoRandomInt: RandomInt = (maxExclusive) => {
  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive)
  const buffer = new Uint32Array(1)
  let value: number
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % maxExclusive
}

// Fisher–Yates shuffle; returns a new array
export function shuffle<T>(items: readonly T[], randomInt: RandomInt): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

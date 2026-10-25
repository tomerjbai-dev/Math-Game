import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PracticeScreen, { FEEDBACK_DELAY_MS } from './PracticeScreen.tsx'
import { GameProvider } from '../game/GameContext.tsx'
import { createInitialState, type GameState } from '../game/gameState.ts'
import { parsePair, product } from '../game/exercises.ts'
import { sequenceRandom } from '../test/helpers.ts'

function exerciseText(state: GameState, index: number): string {
  const [a, b] = parsePair(state.round.order[index])
  return `${a} × ${b} = ?`
}

function setup() {
  const state = createInitialState(sequenceRandom())
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(
    <GameProvider initialState={state}>
      <PracticeScreen />
    </GameProvider>,
  )
  const input = screen.getByLabelText('התשובה שלך')
  const check = screen.getByRole('button', { name: 'בדוק תשובה' })
  const correct = String(product(state.round.order[0]))
  const wrong = String(product(state.round.order[0]) + 1)
  return { state, user, input, check, correct, wrong }
}

function scoreText(): string | null {
  return screen.getByText('מתוך 55', { exact: false }).textContent
}

describe('PracticeScreen', () => {
  beforeEach(() => {
    // shouldAdvanceTime keeps user-event's internal delays from hanging
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows success, then moves to a new exercise without another click', async () => {
    const { state, user, input, check, correct } = setup()
    expect(screen.getByText(exerciseText(state, 0))).toBeInTheDocument()

    await user.type(input, correct)
    await user.click(check)
    expect(screen.getByText('כל הכבוד! תשובה נכונה')).toBeInTheDocument()
    expect(input).toBeDisabled()
    expect(check).toBeDisabled()
    expect(screen.getByText(exerciseText(state, 0))).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(screen.getByText(exerciseText(state, 1))).toBeInTheDocument()
    expect(screen.queryByText('כל הכבוד! תשובה נכונה')).not.toBeInTheDocument()
    expect(input).toBeEnabled()
    expect(input).toHaveFocus()
    expect(scoreText()).toBe('1 מתוך 55')
  })

  it('checks the answer with Enter and ignores a repeated Enter', async () => {
    const { user, input, correct } = setup()
    await user.type(input, `${correct}{Enter}{Enter}`)
    expect(screen.getByText('כל הכבוד! תשובה נכונה')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(scoreText()).toBe('1 מתוך 55')
  })

  it('ignores a fast double tap on the check button', async () => {
    const { user, input, check, correct } = setup()
    await user.type(input, correct)
    await user.dblClick(check)
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(scoreText()).toBe('1 מתוך 55')
  })

  it('a first mistake keeps the exercise and clears the field', async () => {
    const { state, user, input, check, wrong } = setup()
    await user.type(input, wrong)
    await user.click(check)
    expect(screen.getByText('לא נורא! יש לך עוד ניסיון אחד')).toBeInTheDocument()
    expect(screen.getByText(exerciseText(state, 0))).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(input).toBeEnabled()
    expect(scoreText()).toBe('0 מתוך 55')
  })

  it('a second mistake ends the round', async () => {
    const { user, input, check, wrong } = setup()
    await user.type(input, wrong)
    await user.click(check)
    await user.type(input, wrong)
    await user.click(check)
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
    expect(screen.queryByLabelText('התשובה שלך')).not.toBeInTheDocument()
  })

  it('empty or invalid input shows a message and does not use an attempt', async () => {
    const { user, input, check, wrong } = setup()
    await user.click(check)
    expect(screen.getByText('נא להקליד מספר בין 1 ל-100')).toBeInTheDocument()
    for (const text of ['0', '150', 'abc']) {
      await user.clear(input)
      await user.type(input, text)
      await user.click(check)
      expect(screen.getByText('נא להקליד מספר בין 1 ל-100')).toBeInTheDocument()
    }

    // Still two attempts: one mistake must not end the round
    await user.clear(input)
    await user.type(input, wrong)
    await user.click(check)
    expect(screen.getByText('לא נורא! יש לך עוד ניסיון אחד')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'הסבב הסתיים' })).not.toBeInTheDocument()
  })
})

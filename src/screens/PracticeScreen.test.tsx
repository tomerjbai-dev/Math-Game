import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PracticeScreen, { FEEDBACK_DELAY_MS } from './PracticeScreen.tsx'
import { GameProvider, useGame } from '../game/GameContext.tsx'
import { createInitialState, type GameState } from '../game/gameState.ts'
import { parsePair, product } from '../game/exercises.ts'
import { sequenceRandom, stateAt } from '../test/helpers.ts'

function exerciseText(state: GameState, index: number): string {
  const [a, b] = parsePair(state.round.order[index])
  return `${a} × ${b} = ?`
}

// Exposes the in-memory personal best, which has no UI until M4
function BestScoreProbe() {
  const { state } = useGame()
  // Attribute rather than text, so it never clashes with on-screen numbers
  return <output data-testid="best" data-value={state.bestScore} />
}

function setup(state: GameState = createInitialState(sequenceRandom())) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const onNavigate = vi.fn()
  render(
    <GameProvider initialState={state}>
      <PracticeScreen onNavigate={onNavigate} />
      <BestScoreProbe />
    </GameProvider>,
  )
  const input = screen.getByLabelText('התשובה שלך')
  const check = screen.getByRole('button', { name: 'בדוק תשובה' })
  const current = state.round.order[state.round.index]
  const correct = String(product(current))
  const wrong = String(product(current) + 1)
  return { state, user, onNavigate, input, check, correct, wrong }
}

async function loseRound(user: ReturnType<typeof userEvent.setup>, wrong: string) {
  await user.type(screen.getByLabelText('התשובה שלך'), `${wrong}{Enter}`)
  await user.type(screen.getByLabelText('התשובה שלך'), `${wrong}{Enter}`)
}

function bestScore(): string | null {
  return screen.getByTestId('best').getAttribute('data-value')
}

function scoreText(): string | null {
  return screen.getByText('מתוך 45', { exact: false }).textContent
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
    expect(scoreText()).toBe('1 מתוך 45')
  })

  it('checks the answer with Enter and ignores a repeated Enter', async () => {
    const { user, input, correct } = setup()
    await user.type(input, `${correct}{Enter}{Enter}`)
    expect(screen.getByText('כל הכבוד! תשובה נכונה')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(scoreText()).toBe('1 מתוך 45')
  })

  it('ignores a fast double tap on the check button', async () => {
    const { user, input, check, correct } = setup()
    await user.type(input, correct)
    await user.dblClick(check)
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(scoreText()).toBe('1 מתוך 45')
  })

  it('a first mistake keeps the exercise and clears the field', async () => {
    const { state, user, input, check, wrong } = setup()
    await user.type(input, wrong)
    await user.click(check)
    expect(screen.getByText('לא נורא! יש לך עוד ניסיון אחד')).toBeInTheDocument()
    expect(screen.getByText(exerciseText(state, 0))).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(input).toBeEnabled()
    expect(scoreText()).toBe('0 מתוך 45')
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

  it('after two mistakes shows the round score and waits for "נסו שוב!"', async () => {
    const { user, wrong } = setup(stateAt(12))
    await loseRound(user, wrong)

    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
    expect(screen.getByText('לא הצלחת לפתור את התרגיל בשתי ההזדמנויות.')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'נסו שוב!' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'חזרה לבית' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'התחל מחדש' })).not.toBeInTheDocument()

    // No automatic new round
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS * 4)
    })
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })

  it('"נסו שוב!" starts a fresh round and keeps the personal best', async () => {
    const { user, wrong } = setup(stateAt(12, 20))
    await loseRound(user, wrong)
    await user.click(screen.getByRole('button', { name: 'נסו שוב!' }))

    expect(scoreText()).toBe('0 מתוך 45')
    expect(screen.getByLabelText('התשובה שלך')).toHaveValue('')
    expect(screen.getByLabelText('התשובה שלך')).toHaveFocus()
    expect(screen.getByText(/^\d+ × \d+ = \?$/)).toBeInTheDocument()
    expect(bestScore()).toBe('20')
  })

  it('"חזרה לבית" only navigates home', async () => {
    const { user, onNavigate, wrong } = setup()
    await loseRound(user, wrong)
    await user.click(screen.getByRole('button', { name: 'חזרה לבית' }))
    expect(onNavigate).toHaveBeenCalledWith('home')
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })

  it('solving the last exercise shows the win state, then a new round can start', async () => {
    const { user, input, correct } = setup(stateAt(44))
    await user.type(input, `${correct}{Enter}`)
    expect(screen.getByText('כל הכבוד! תשובה נכונה')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(screen.getByRole('heading', { name: 'כל הכבוד!' })).toBeInTheDocument()
    expect(screen.getByText('פתרת את כל 45 התרגילים בהצלחה!')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.queryByLabelText('התשובה שלך')).not.toBeInTheDocument()
    expect(bestScore()).toBe('45')

    await user.click(screen.getByRole('button', { name: 'התחל סבב חדש' }))
    expect(scoreText()).toBe('0 מתוך 45')
    expect(bestScore()).toBe('45')
  })

  it('cancelling "התחל מחדש" keeps the round exactly as it was', async () => {
    const { state, user, input, check, wrong } = setup(stateAt(7))
    await user.type(input, wrong)
    await user.click(check)
    await user.type(input, '5')

    await user.click(screen.getByRole('button', { name: 'התחל מחדש' }))
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'להתחיל סבב חדש? הניקוד בסבב הנוכחי יימחק, השיא האישי יישמר.',
    )
    expect(screen.getByRole('button', { name: 'כן, להתחיל מחדש' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ביטול' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(exerciseText(state, 7))).toBeInTheDocument()
    expect(scoreText()).toBe('7 מתוך 45')
    expect(input).toHaveValue('5')
    expect(screen.getByText('לא נורא! יש לך עוד ניסיון אחד')).toBeInTheDocument()

    // Still only one attempt left
    await user.clear(input)
    await user.type(input, `${wrong}{Enter}`)
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })

  it('Escape closes the confirmation without changes', async () => {
    const { state, user } = setup(stateAt(3))
    await user.click(screen.getByRole('button', { name: 'התחל מחדש' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(exerciseText(state, 3))).toBeInTheDocument()
    expect(scoreText()).toBe('3 מתוך 45')
  })

  it('confirming "התחל מחדש" resets the round to 0 and keeps the personal best', async () => {
    const { user, input, check, wrong } = setup(stateAt(9))
    await user.type(input, wrong)
    await user.click(check)
    await user.click(screen.getByRole('button', { name: 'התחל מחדש' }))
    await user.click(screen.getByRole('button', { name: 'כן, להתחיל מחדש' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(scoreText()).toBe('0 מתוך 45')
    expect(screen.queryByText('לא נורא! יש לך עוד ניסיון אחד')).not.toBeInTheDocument()
    expect(bestScore()).toBe('9')
  })

  it('"התחל מחדש" is disabled during the success message', async () => {
    const { user, input, correct } = setup()
    await user.type(input, `${correct}{Enter}`)
    expect(screen.getByRole('button', { name: 'התחל מחדש' })).toBeDisabled()
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DELAY_MS)
    })
    expect(screen.getByRole('button', { name: 'התחל מחדש' })).toBeEnabled()
  })
})

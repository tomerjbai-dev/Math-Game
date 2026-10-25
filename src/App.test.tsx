import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.tsx'
import { STORAGE_KEY } from './game/storage.ts'
import type { GameState } from './game/gameState.ts'
import { stateAt } from './test/helpers.ts'

function readExercise(): { text: string; answer: number } {
  const text = screen.getByText(/^\d+ × \d+ = \?$/).textContent!
  const [a, b] = text.match(/\d+/g)!.map(Number)
  return { text, answer: a * b }
}

describe('App navigation', () => {
  it('keeps the exercise and the remaining attempt when leaving practice', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = within(screen.getByRole('navigation'))

    await user.click(screen.getByRole('button', { name: 'בואו נתרגל!' }))
    const exercise = readExercise()
    await user.type(screen.getByLabelText('התשובה שלך'), `${exercise.answer + 1}{Enter}`)
    expect(screen.getByText('לא נורא! יש לך עוד ניסיון אחד')).toBeInTheDocument()

    await user.click(nav.getByRole('button', { name: 'בית' }))
    await user.click(nav.getByRole('button', { name: 'אודות' }))
    await user.click(nav.getByRole('button', { name: 'תרגול' }))

    expect(readExercise().text).toBe(exercise.text)
    // Exactly one attempt left: another mistake ends the round
    await user.type(screen.getByLabelText('התשובה שלך'), `${exercise.answer + 1}{Enter}`)
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })

  it('keeps the end state inside practice when going home and back', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = within(screen.getByRole('navigation'))

    await user.click(nav.getByRole('button', { name: 'תרגול' }))
    const wrong = readExercise().answer + 1
    await user.type(screen.getByLabelText('התשובה שלך'), `${wrong}{Enter}`)
    await user.type(screen.getByLabelText('התשובה שלך'), `${wrong}{Enter}`)
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
    expect(nav.getAllByRole('button')).toHaveLength(3)
    expect(nav.getByRole('button', { name: 'תרגול' })).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('button', { name: 'חזרה לבית' }))
    expect(screen.getByRole('heading', { name: 'אלופי הכפל' })).toBeInTheDocument()
    expect(nav.getByRole('button', { name: 'בית' })).toHaveAttribute('aria-current', 'page')

    await user.click(nav.getByRole('button', { name: 'תרגול' }))
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })
})

function seed(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, ...state }))
}

function statText(label: string): string | null {
  return screen.getByRole('heading', { name: label }).nextElementSibling!.textContent
}

// Unmounting and rendering again stands in for a reload or reopening the app
function reload(view: ReturnType<typeof render>) {
  view.unmount()
  return render(<App />)
}

async function openPractice(user: ReturnType<typeof userEvent.setup>) {
  await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'תרגול' }))
}

const SAVE_WARNING = 'שימו לב: לא ניתן לשמור את ההתקדמות במכשיר הזה'

describe('Saving on this device', () => {
  it('restores the score, exercise and solved exercises after a reload', async () => {
    const user = userEvent.setup()
    const saved = stateAt(3)
    seed(saved)
    let view = render(<App />)
    await openPractice(user)
    expect(screen.getByText('3')).toBeInTheDocument()

    const exercise = readExercise()
    await user.type(screen.getByLabelText('התשובה שלך'), `${exercise.answer}{Enter}`)
    expect(screen.getByText('כל הכבוד! תשובה נכונה')).toBeInTheDocument()

    // Closing during the success message shows the next exercise without a bonus point
    view = reload(view)
    await openPractice(user)
    const [a, b] = saved.round.order[4].split('-')
    expect(readExercise().text).toBe(`${a} × ${b} = ?`)
    expect(screen.getByText('4')).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.round.order).toEqual(saved.round.order)
    expect(stored.round.index).toBe(4)
    view.unmount()
  })

  it('allows only one more attempt after reloading following a first mistake', async () => {
    const user = userEvent.setup()
    const view = render(<App />)
    await openPractice(user)
    const exercise = readExercise()
    await user.type(screen.getByLabelText('התשובה שלך'), `${exercise.answer + 1}{Enter}`)

    reload(view)
    await openPractice(user)
    expect(readExercise().text).toBe(exercise.text)
    await user.type(screen.getByLabelText('התשובה שלך'), `${exercise.answer + 1}{Enter}`)
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })

  it('keeps the end state after a reload', async () => {
    const user = userEvent.setup()
    const lost = stateAt(6)
    seed({ ...lost, round: { ...lost.round, status: 'lost', mistakesOnCurrent: 1 } })
    render(<App />)
    await openPractice(user)
    expect(screen.getByRole('heading', { name: 'הסבב הסתיים' })).toBeInTheDocument()
  })

  it('keeps a broken personal best through a restart and a reload', async () => {
    const user = userEvent.setup()
    seed(stateAt(5, 5))
    let view = render(<App />)
    await openPractice(user)
    await user.type(screen.getByLabelText('התשובה שלך'), `${readExercise().answer}{Enter}`)

    view = reload(view)
    await openPractice(user)
    await user.click(screen.getByRole('button', { name: 'התחל מחדש' }))
    await user.click(screen.getByRole('button', { name: 'כן, להתחיל מחדש' }))

    reload(view)
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'אודות' }))
    expect(statText('הניקוד הנוכחי')).toBe('0 מתוך 45')
    expect(statText('השיא האישי')).toBe('6 מתוך 45')
  })

  it('starts a fresh round when the saved data is corrupted', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, '{"schemaVersion":1,"bestScore":"lots"}')
    render(<App />)
    expect(screen.queryByText(SAVE_WARNING)).not.toBeInTheDocument()
    await openPractice(user)
    expect(readExercise().text).toMatch(/^\d+ × \d+ = \?$/)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).round.score).toBe(0)
  })

  it.each([
    ['writing is blocked', () => vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })],
    ['localStorage cannot be accessed', () => vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked')
    })],
  ])('keeps practice working with a warning when %s', async (_, block) => {
    block()
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText(SAVE_WARNING)).toBeInTheDocument()

    await openPractice(user)
    expect(screen.getByText(SAVE_WARNING)).toBeInTheDocument()
    await user.type(screen.getByLabelText('התשובה שלך'), `${readExercise().answer}{Enter}`)
    expect(screen.getByText('כל הכבוד! תשובה נכונה')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})

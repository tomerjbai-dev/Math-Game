import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.tsx'

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
})

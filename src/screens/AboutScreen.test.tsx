import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import AboutScreen from './AboutScreen.tsx'
import { GameProvider } from '../game/GameContext.tsx'
import { stateAt } from '../test/helpers.ts'

function statText(label: string): string | null {
  return screen.getByRole('heading', { name: label }).nextElementSibling!.textContent
}

describe('AboutScreen', () => {
  it('shows the current score and the personal best from the game state', () => {
    render(
      <GameProvider initialState={stateAt(12, 30)}>
        <AboutScreen />
      </GameProvider>,
    )
    expect(statText('הניקוד הנוכחי')).toBe('12 מתוך 45')
    expect(statText('השיא האישי')).toBe('30 מתוך 45')
    expect(screen.queryByText(/בשלב הבא של הפיתוח/)).not.toBeInTheDocument()
  })

  it('renders a full 1–10 multiplication table with row and column headers', () => {
    render(
      <GameProvider initialState={stateAt(0)}>
        <AboutScreen />
      </GameProvider>,
    )
    const table = within(screen.getByRole('table', { name: 'טבלת הכפל' }))
    const factors = Array.from({ length: 10 }, (_, i) => String(i + 1))

    expect(table.getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['×', ...factors])
    expect(table.getAllByRole('rowheader').map((th) => th.textContent)).toEqual(factors)

    const rows = table.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(10)
    rows.forEach((row, r) => {
      const cells = within(row).getAllByRole('cell')
      expect(cells.map((td) => Number(td.textContent))).toEqual(factors.map((_, c) => (r + 1) * (c + 1)))
    })
  })
})

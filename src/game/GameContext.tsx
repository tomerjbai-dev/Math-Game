import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { createInitialState, gameReducer, type GameAction, type GameState } from './gameState.ts'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

// Sits above the screen switch so navigating never resets the round
export function GameProvider({ children, initialState }: { children: ReactNode; initialState?: GameState }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => init ?? createInitialState())
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside GameProvider')
  return value
}

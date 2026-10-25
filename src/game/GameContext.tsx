import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { createInitialState, gameReducer, type GameAction, type GameState } from './gameState.ts'
import { getStorage, loadGame, saveGame } from './storage.ts'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  // False when progress cannot be saved on this device (PRD edge cases)
  storageAvailable: boolean
}

const GameContext = createContext<GameContextValue | null>(null)

// Sits above the screen switch so navigating never resets the round
export function GameProvider({ children, initialState }: { children: ReactNode; initialState?: GameState }) {
  const [storage] = useState(getStorage)
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState,
    (init) => init ?? loadGame(storage) ?? createInitialState(),
  )
  const [storageAvailable, setStorageAvailable] = useState(storage !== null)

  // Save after every computed state change; invalid saved data gets replaced here (ADR-2)
  useEffect(() => {
    setStorageAvailable(saveGame(storage, state))
  }, [storage, state])

  return <GameContext.Provider value={{ state, dispatch, storageAvailable }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside GameProvider')
  return value
}

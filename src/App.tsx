import { useState } from 'react'
import type { Screen } from './types.ts'
import BottomNav from './components/BottomNav.tsx'
import StorageNotice from './components/StorageNotice.tsx'
import HomeScreen from './screens/HomeScreen.tsx'
import PracticeScreen from './screens/PracticeScreen.tsx'
import AboutScreen from './screens/AboutScreen.tsx'
import { GameProvider } from './game/GameContext.tsx'
import styles from './App.module.css'

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home')

  return (
    <GameProvider>
      <div className={styles.shell}>
        <main className={styles.content}>
          <StorageNotice />
          {activeScreen === 'home' && <HomeScreen onNavigate={setActiveScreen} />}
          {activeScreen === 'practice' && <PracticeScreen onNavigate={setActiveScreen} />}
          {activeScreen === 'about' && <AboutScreen />}
        </main>
        <BottomNav active={activeScreen} onNavigate={setActiveScreen} />
      </div>
    </GameProvider>
  )
}

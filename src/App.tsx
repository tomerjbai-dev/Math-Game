import { useState } from 'react'
import type { Screen } from './types.ts'
import BottomNav from './components/BottomNav.tsx'
import HomeScreen from './screens/HomeScreen.tsx'
import PracticeScreen from './screens/PracticeScreen.tsx'
import AboutScreen from './screens/AboutScreen.tsx'
import styles from './App.module.css'

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home')

  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        {activeScreen === 'home' && <HomeScreen onNavigate={setActiveScreen} />}
        {activeScreen === 'practice' && <PracticeScreen />}
        {activeScreen === 'about' && <AboutScreen />}
      </main>
      <BottomNav active={activeScreen} onNavigate={setActiveScreen} />
    </div>
  )
}

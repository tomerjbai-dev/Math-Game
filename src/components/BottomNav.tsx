import type { ReactNode } from 'react'
import type { Screen } from '../types.ts'
import { HomeIcon, InfoIcon, TimesIcon } from './icons.tsx'
import styles from './BottomNav.module.css'

type Props = {
  active: Screen
  onNavigate: (screen: Screen) => void
}

// DOM order renders right-to-left on screen (dir="rtl")
const ITEMS: { screen: Screen; label: string; icon: ReactNode }[] = [
  { screen: 'home', label: 'בית', icon: <HomeIcon /> },
  { screen: 'practice', label: 'תרגול', icon: <TimesIcon /> },
  { screen: 'about', label: 'אודות', icon: <InfoIcon /> },
]

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className={styles.nav} aria-label="ניווט ראשי">
      <ul className={styles.list}>
        {ITEMS.map((item) => {
          const isActive = item.screen === active
          return (
            <li key={item.screen}>
              <button
                type="button"
                className={isActive ? `${styles.item} ${styles.active}` : styles.item}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.screen)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

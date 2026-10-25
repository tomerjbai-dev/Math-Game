import type { ReactNode } from 'react'
import type { Screen } from '../types.ts'
import { HomeIcon, InfoIcon, TimesIcon } from './icons.tsx'
import styles from './BottomNav.module.css'

type Props = {
  active: Screen
  onNavigate: (screen: Screen) => void
}

// DOM order renders right-to-left on screen (dir="rtl"); the active item gets a filled icon
const ITEMS: { screen: Screen; label: string; icon: (active: boolean) => ReactNode }[] = [
  { screen: 'home', label: 'בית', icon: (active) => <HomeIcon filled={active} /> },
  { screen: 'practice', label: 'תרגול', icon: () => <TimesIcon /> },
  { screen: 'about', label: 'אודות', icon: (active) => <InfoIcon filled={active} /> },
]

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className={styles.nav} aria-label="ניווט ראשי" data-nav>
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
                {item.icon(isActive)}
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

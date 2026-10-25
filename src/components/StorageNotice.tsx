import { useGame } from '../game/GameContext.tsx'
import styles from './StorageNotice.module.css'

// Shown on every screen while progress cannot be saved (PRD edge cases)
export default function StorageNotice() {
  const { storageAvailable } = useGame()
  if (storageAvailable) return null

  return (
    <p className={styles.notice} role="status">
      <span className={styles.icon} aria-hidden="true">
        i
      </span>
      שימו לב: לא ניתן לשמור את ההתקדמות במכשיר הזה
    </p>
  )
}

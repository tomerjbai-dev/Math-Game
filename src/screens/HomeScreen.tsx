import type { Screen } from '../types.ts'
import illustration from '../assets/home-illustration.png'
import { InfoIcon, PlayIcon } from '../components/icons.tsx'
import styles from './HomeScreen.module.css'

type Props = {
  onNavigate: (screen: Screen) => void
}

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <section className={styles.home}>
      <h1 className={`highlight ${styles.title}`}>אלופי הכפל</h1>
      <p className={styles.subtitle}>מתרגלים ומשתפרים בלוח הכפל <span dir="ltr">1–10</span></p>
      <img
        className={styles.illustration}
        src={illustration}
        alt="ילד מצויר כותב תרגילי חשבון במחברת"
      />
      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={() => onNavigate('practice')}>
          <PlayIcon />
          בואו נתרגל!
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onNavigate('about')}>
          <span className={styles.infoIcon}>
            <InfoIcon size={24} filled />
          </span>
          אודות
        </button>
      </div>
    </section>
  )
}

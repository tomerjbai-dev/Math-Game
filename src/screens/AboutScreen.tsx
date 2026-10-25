import { useGame } from '../game/GameContext.tsx'
import { TOTAL_EXERCISES } from '../game/exercises.ts'
import MultiplicationTable from '../components/MultiplicationTable.tsx'
import styles from './AboutScreen.module.css'

export default function AboutScreen() {
  const { state } = useGame()

  return (
    <section className={styles.about}>
      <h1 className={styles.title}>אודות</h1>

      <div className={`card ${styles.stats}`}>
        <div className={styles.stat}>
          <h2 className={styles.statLabel}>הניקוד הנוכחי</h2>
          <p className={styles.statValue}>
            <span className={styles.statNumber}>{state.round.score}</span> מתוך {TOTAL_EXERCISES}
          </p>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <h2 className={styles.statLabel}>השיא האישי</h2>
          <p className={styles.statValue}>
            <span className={styles.statNumber}>{state.bestScore}</span> מתוך {TOTAL_EXERCISES}
          </p>
        </div>
      </div>

      <p className={styles.text}>
        אלופי הכפל היא אפליקציה לתרגול לוח הכפל <span className={styles.range} dir="ltr">1–10</span>. בכל סבב מופיעים 45 תרגילים ייחודיים. לכל
        תרגיל יש שתי הזדמנויות. המטרה היא לפתור את כל התרגילים בהצלחה!
      </p>

      <h2>טבלת הכפל</h2>
      <MultiplicationTable />
    </section>
  )
}

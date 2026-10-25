import styles from './AboutScreen.module.css'

// Basic structure for M1; live scores and the multiplication table arrive in M4
export default function AboutScreen() {
  return (
    <section className={styles.about}>
      <h1 className={styles.title}>אודות</h1>

      <div className={`card ${styles.stats}`}>
        <div className={styles.stat}>
          <h2 className={styles.statLabel}>הניקוד הנוכחי</h2>
          <p className={styles.statValue}>—</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <h2 className={styles.statLabel}>השיא האישי</h2>
          <p className={styles.statValue}>—</p>
        </div>
        <p className={styles.pending}>הנתונים יוצגו בשלב הבא של הפיתוח</p>
      </div>

      <p className={styles.text}>
        אלופי הכפל היא אפליקציה לתרגול לוח הכפל <span dir="ltr">1–10</span>. בכל סבב מופיעים 45 תרגילים ייחודיים. לכל
        תרגיל יש שתי הזדמנויות. המטרה היא לפתור את כל התרגילים בהצלחה!
      </p>

      <h2>טבלת הכפל</h2>
      <p className={styles.pending}>טבלת הכפל תתווסף בשלב הבא של הפיתוח</p>
    </section>
  )
}

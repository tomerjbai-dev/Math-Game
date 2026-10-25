import styles from './PracticeScreen.module.css'

// Static structure only for M1; game logic arrives in M2
export default function PracticeScreen() {
  return (
    <section className={styles.practice}>
      <h1 className={styles.srOnly}>תרגול</h1>
      <p className={styles.notice} role="status">
        התרגול ייפתח בשלב הבא של הפיתוח
      </p>

      <div className={`card ${styles.score}`}>
        <span>0</span> מתוך 55
      </div>

      <div className={`card ${styles.exercise}`} dir="ltr" aria-label="תרגיל לדוגמה">
        ? × ? = ?
      </div>

      <label className={styles.srOnly} htmlFor="answer">
        התשובה שלך
      </label>
      <input
        id="answer"
        className={styles.answer}
        type="text"
        inputMode="numeric"
        dir="ltr"
        disabled
      />

      <button type="button" className="btn btn-check" disabled>
        בדוק תשובה
      </button>
      <button type="button" className={`btn btn-secondary ${styles.restart}`} disabled>
        התחל מחדש
      </button>
    </section>
  )
}

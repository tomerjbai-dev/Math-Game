import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useGame } from '../game/GameContext.tsx'
import { currentPair } from '../game/gameState.ts'
import { TOTAL_EXERCISES, parsePair, product, type DisplayPair } from '../game/exercises.ts'
import { parseAnswer } from '../game/answer.ts'
import styles from './PracticeScreen.module.css'

// How long the success message stays before the next exercise (ARCHITECTURE 2.4)
export const FEEDBACK_DELAY_MS = 1500

type Feedback = { kind: 'success' | 'error' | 'info'; text: string }

const MESSAGES = {
  success: 'כל הכבוד! תשובה נכונה',
  firstMistake: 'לא נורא! יש לך עוד ניסיון אחד',
  invalid: 'נא להקליד מספר בין 1 ל-100',
}

const FEEDBACK_ICONS = { success: '✓', error: '×', info: 'i' }

export default function PracticeScreen() {
  const { state, dispatch } = useGame()
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  // The solved exercise stays on screen during the success message,
  // even though the reducer has already advanced to the next one
  const [solvedPair, setSolvedPair] = useState<DisplayPair | null>(null)
  // Blocks repeated checks (fast taps, repeated Enter) before the re-render lands
  const advancingRef = useRef(false)
  const refocusRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (solvedPair === null) return
    const timer = setTimeout(() => {
      advancingRef.current = false
      refocusRef.current = true
      setSolvedPair(null)
      setFeedback(null)
    }, FEEDBACK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [solvedPair])

  // Return focus to the re-enabled field once the next exercise appears
  useEffect(() => {
    if (solvedPair === null && refocusRef.current) {
      refocusRef.current = false
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [solvedPair])

  const pair = solvedPair ?? currentPair(state)
  const { status, score } = state.round
  const advancing = solvedPair !== null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (advancingRef.current || pair === null) return

    const value = parseAnswer(answer)
    if (value === null) {
      setFeedback({ kind: 'info', text: MESSAGES.invalid })
      return
    }

    const correct = value === product(pair)
    dispatch({ type: 'answer', value })
    setAnswer('')
    if (correct) {
      advancingRef.current = true
      setSolvedPair(pair)
      setFeedback({ kind: 'success', text: MESSAGES.success })
    } else if (state.round.mistakesOnCurrent === 0) {
      setFeedback({ kind: 'error', text: MESSAGES.firstMistake })
    } else {
      setFeedback(null)
    }
  }

  const scoreBadge = (
    <div className={`card ${styles.score}`}>
      <span>{score}</span> מתוך {TOTAL_EXERCISES}
    </div>
  )

  // Basic end states inside the practice screen; full design arrives in M3
  if (!advancing && status !== 'playing') {
    return (
      <section className={styles.practice}>
        <div className={`card ${styles.ended}`} role="status">
          <h1>{status === 'won' ? 'כל הכבוד!' : 'הסבב הסתיים'}</h1>
        </div>
        {scoreBadge}
      </section>
    )
  }

  const [a, b] = pair ? parsePair(pair) : [0, 0]

  return (
    <section className={styles.practice}>
      <h1 className={styles.srOnly}>תרגול</h1>
      {scoreBadge}

      <div className={`card ${styles.exercise}`} dir="ltr" aria-label={`כמה זה ${a} כפול ${b}?`}>
        {a} × {b} = ?
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.srOnly} htmlFor="answer">
          התשובה שלך
        </label>
        <input
          ref={inputRef}
          id="answer"
          className={styles.answer}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          dir="ltr"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={advancing}
        />

        <div className={styles.feedbackArea} role="status" aria-live="polite">
          {feedback && (
            <p className={`${styles.feedback} ${styles[feedback.kind]}`}>
              <span className={styles.feedbackIcon} aria-hidden="true">
                {FEEDBACK_ICONS[feedback.kind]}
              </span>
              {feedback.text}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-check" disabled={advancing}>
          בדוק תשובה
        </button>
      </form>

      <button type="button" className={`btn btn-secondary ${styles.restart}`} disabled>
        התחל מחדש
      </button>
    </section>
  )
}

import { useEffect, useRef } from 'react'
import { TOTAL_EXERCISES } from '../game/exercises.ts'
import { HomeIcon, LostIcon, StarIcon, TrophyCelebration } from './icons.tsx'
import styles from './RoundResult.module.css'

type Props = {
  status: 'won' | 'lost'
  score: number
  onNewRound: () => void
  onHome: () => void
}

const TEXTS = {
  won: {
    title: 'כל הכבוד!',
    line: `פתרת את כל ${TOTAL_EXERCISES} התרגילים בהצלחה!`,
    action: 'התחל סבב חדש',
  },
  lost: {
    title: 'הסבב הסתיים',
    line: 'לא הצלחת לפתור את התרגיל בשתי ההזדמנויות.',
    action: 'נסו שוב!',
  },
}

// End-of-round state shown inside the practice screen (DESIGN 1.2), not a separate screen
export default function RoundResult({ status, score, onNewRound, onHome }: Props) {
  const texts = TEXTS[status]
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the title so screen readers announce the result
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <section className={styles.result}>
      {status === 'won' ? <TrophyCelebration /> : <LostIcon size={112} />}
      <h1
        ref={titleRef}
        className={`highlight ${status === 'lost' ? 'highlight-pink' : ''} ${styles.title}`}
        tabIndex={-1}
      >
        {texts.title}
      </h1>
      <p className={styles.line}>{texts.line}</p>

      <div className={`card card-paper ${styles.scoreCard}`}>
        <p>הניקוד שלך</p>
        <div className={styles.scoreRow}>
          {status === 'won' && <StarIcon size={32} />}
          <p className={`${styles.scoreValue} ${styles[status]}`}>{score}</p>
          {status === 'won' && <StarIcon size={32} />}
        </div>
        <p>מתוך {TOTAL_EXERCISES}</p>
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={onNewRound}>
          {texts.action}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onHome}>
          <span className={styles.homeIcon}>
            <HomeIcon size={24} filled />
          </span>
          חזרה לבית
        </button>
      </div>
    </section>
  )
}

import { useEffect, useRef, type KeyboardEvent } from 'react'
import styles from './ConfirmDialog.module.css'

type Props = {
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

// In-app confirmation (not window.confirm), as DESIGN 1.2 requires
export default function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Start on the safe choice
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') onCancel()
  }

  return (
    <div className={styles.backdrop} onClick={onCancel} onKeyDown={handleKeyDown}>
      <div
        className={`card ${styles.dialog}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <p id="confirm-message" className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button ref={cancelRef} type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

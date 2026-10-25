import styles from './MultiplicationTable.module.css'

const FACTORS = Array.from({ length: 10 }, (_, i) => i + 1)

// Full 1–10 reference table (PRD FR-01); follows the app's RTL direction
export default function MultiplicationTable() {
  return (
    <div className={styles.frame}>
      <table className={styles.table} aria-label="טבלת הכפל">
        <thead>
          <tr>
            <th scope="col" className={styles.corner}>
              ×
            </th>
            {FACTORS.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FACTORS.map((row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {FACTORS.map((column) => (
                <td key={column}>{row * column}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

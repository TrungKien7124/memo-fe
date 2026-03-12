import clsx from 'clsx'
import styles from './StreakCounter.module.css'

export function StreakCounter({ streak = 0, className, style }) {
  return (
    <div className={clsx(styles.counter, streak > 0 && styles.active, className)} style={style}>
      <span className={styles.flame}>🔥</span>
      <span className={styles.value}>{streak}</span>
    </div>
  )
}

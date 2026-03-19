import clsx from 'clsx'
import styles from './StreakWidget.module.css'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function StreakWidget({ streak = null, lastSevenDays = [], isUnavailable = false }) {
  const safeStreak = Number.isFinite(streak) ? streak : 0
  const filledDays = !isUnavailable && lastSevenDays.length > 0
    ? lastSevenDays
    : Array.from({ length: 7 }, (_, i) => {
        return !isUnavailable && safeStreak > 0 && i < safeStreak
      })

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Streak</h3>
      <div className={styles.streakRow}>
        <span className={styles.flame}>🔥</span>
        <span className={styles.count}>
          {isUnavailable ? 'Streak unavailable' : `${safeStreak} day${safeStreak !== 1 ? 's' : ''}`}
        </span>
      </div>
      <div className={styles.daysRow}>
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className={clsx(
              styles.dayCircle,
              filledDays[i] && styles.dayCircleActive,
              i === 6 && styles.dayCircleToday
            )}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

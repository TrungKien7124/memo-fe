import clsx from 'clsx'
import styles from './DailyGoalWidget.module.css'

export function DailyGoalWidget({ currentXP = null, targetXP = null, isUnavailable = false }) {
  const hasGoalData = !isUnavailable && Number.isFinite(currentXP) && Number.isFinite(targetXP) && targetXP > 0
  const percent = hasGoalData ? Math.min(100, Math.round((currentXP / targetXP) * 100)) : 0
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Daily Goal</h3>
      <div className={styles.progressWrapper}>
        <div className={styles.circle}>
          <svg className={styles.svg} width="120" height="120" viewBox="0 0 120 120">
            <circle
              className={styles.bgCircle}
              cx="60"
              cy="60"
              r={radius}
            />
            <circle
              className={styles.progressCircle}
              cx="60"
              cy="60"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
        </div>
        <span className={clsx(styles.label, styles.xpText)}>
          {hasGoalData ? `${currentXP} / ${targetXP} XP` : 'Goal data unavailable'}
        </span>
      </div>
    </div>
  )
}

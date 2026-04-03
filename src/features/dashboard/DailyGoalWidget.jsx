import clsx from 'clsx'
import styles from './DailyGoalWidget.module.css'

export function DailyGoalWidget({ currentXP = null, targetXP = null, isUnavailable = false }) {
  const hasGoalData = !isUnavailable && Number.isFinite(currentXP) && Number.isFinite(targetXP) && targetXP > 0
  const isGoalCompleted = hasGoalData && currentXP >= targetXP
  const percent = hasGoalData ? Math.min(100, Math.round((currentXP / targetXP) * 100)) : 0
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Daily XP</h3>
      <div className={styles.progressWrapper}>
        <div className={styles.circle}>
          <svg className={styles.svg} width="132" height="132" viewBox="0 0 132 132">
            <circle
              className={styles.bgCircle}
              cx="66"
              cy="66"
              r={radius}
            />
            <circle
              className={clsx(styles.progressCircle, !isGoalCompleted && styles.progressCirclePending)}
              cx="66"
              cy="66"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className={styles.centerContent}>
            <span className={clsx(styles.xpText, !isGoalCompleted && styles.xpTextPending)}>
              {hasGoalData ? `${currentXP}/${targetXP}` : '--/--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

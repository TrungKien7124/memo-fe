import clsx from 'clsx'
import styles from './ProgressBar.module.css'

export function ProgressBar({ percent = 0, height, color, className, style }) {
  return (
    <div className={clsx(styles.track, className)} style={{ height, ...style }}>
      <div
        className={styles.fill}
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}

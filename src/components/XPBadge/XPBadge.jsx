import clsx from 'clsx'
import { formatXP } from '../../utils/formatXP'
import styles from './XPBadge.module.css'

export function XPBadge({ xp, animate, className, style }) {
  return (
    <div className={clsx(styles.badge, animate && styles.animate, className)} style={style}>
      <span className={styles.icon}>⚡</span>
      <span className={styles.value}>{formatXP(xp)}</span>
      <span className={styles.label}>XP</span>
    </div>
  )
}

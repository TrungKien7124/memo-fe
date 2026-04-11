import styles from './TableActionsScroll.module.css'

/**
 * Horizontal scroll strip for table action cells when buttons exceed column width.
 */
export function TableActionsScroll({ children, className }) {
  return (
    <div className={`${styles.scroll} ${className || ''}`.trim()}>
      <div className={styles.inner}>{children}</div>
    </div>
  )
}

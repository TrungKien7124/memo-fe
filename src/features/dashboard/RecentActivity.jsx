import clsx from 'clsx'
import { BookOutlined, FileTextOutlined, FireOutlined } from '@ant-design/icons'
import styles from './RecentActivity.module.css'

const ICON_MAP = {
  lesson: BookOutlined,
  flashcard: FileTextOutlined,
  streak: FireOutlined,
}

const ICON_CLASS_MAP = {
  lesson: styles.iconLesson,
  flashcard: styles.iconFlashcard,
  streak: styles.iconStreak,
}

export function RecentActivity({ activities = [], isUnavailable = false }) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>Recent Activity</h3>
      <div className={styles.list}>
        {isUnavailable ? (
          <p className={styles.empty}>Recent activity is not available in Sprint 1.</p>
        ) : activities.length === 0 ? (
          <p className={styles.empty}>No recent activity yet.</p>
        ) : (
          activities.map((activity, index) => {
            const Icon = ICON_MAP[activity.type] || BookOutlined
            const iconClass = ICON_CLASS_MAP[activity.type] || styles.iconLesson
            return (
              <div key={index} className={styles.item}>
                <div className={clsx(styles.icon, iconClass)}>
                  <Icon />
                </div>
                <div className={styles.content}>
                  <p className={styles.text}>{activity.text}</p>
                  <p className={styles.time}>{activity.time}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

import clsx from 'clsx'
import styles from './ChatBubble.module.css'

export function ChatBubble({ role = 'user', content, timestamp }) {
  const isUser = role === 'user'

  return (
    <div className={clsx(styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant)}>
      {!isUser && (
        <div className={styles.avatar}>AI</div>
      )}
      <div className={styles.wrapper}>
        <div className={styles.content}>{content}</div>
        {timestamp && <div className={styles.timestamp}>{timestamp}</div>}
      </div>
    </div>
  )
}

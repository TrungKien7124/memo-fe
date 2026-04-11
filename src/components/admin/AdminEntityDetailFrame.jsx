import { Button, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from './AdminEntityDetailFrame.module.css'

const { Title, Text } = Typography

/**
 * Reusable admin “detail workbench” chrome: back navigation + title + optional subtitle + body.
 * Use for course detail, future entity detail screens, etc.
 */
export function AdminEntityDetailFrame({
  backPath = '/admin/courses',
  backLabel = 'Back',
  title,
  subtitle,
  children,
}) {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(backPath)}>
          {backLabel}
        </Button>
        {title != null && (
          <Title level={2} className={styles.title}>{title}</Title>
        )}
        {subtitle != null && (
          <Text className={styles.subtitle}>{subtitle}</Text>
        )}
      </div>
      {children}
    </div>
  )
}

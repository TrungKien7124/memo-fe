import { Button, Card, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import styles from './AdminListCreateLayout.module.css'

/**
 * Admin list shell: one primary card with list content and a bottom-right "create" action.
 * Reuse for courses, modules, folders, etc.
 * Optional `footerExtra` renders before the primary create button (e.g. bulk actions).
 */
export function AdminListCreateLayout({
  title,
  children,
  onCreateClick,
  createLabel = 'Create',
  createIcon = <PlusOutlined />,
  cardClassName,
  extra,
  disabledCreate = false,
  footerExtra = null,
}) {
  return (
    <Card
      title={title}
      extra={extra}
      className={`${styles.panel} ${cardClassName || ''}`.trim()}
    >
      <div className={styles.body}>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Space size="middle" wrap>
            {footerExtra}
            <Button
              type="primary"
              size="large"
              icon={createIcon}
              onClick={onCreateClick}
              disabled={disabledCreate}
            >
              {createLabel}
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  )
}

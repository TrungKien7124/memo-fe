import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Tooltip } from 'antd'

export function TableEditDeleteActions({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  deleteTitle = 'Delete this item?',
  deleteDescription = 'This action cannot be undone.',
}) {
  return (
    <Space size={4}>
      <Tooltip title={editLabel}>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={onEdit}
          aria-label={editLabel}
        />
      </Tooltip>
      <Popconfirm
        title={deleteTitle}
        description={deleteDescription}
        okText="Delete"
        cancelText="Cancel"
        onConfirm={onDelete}
      >
        <Tooltip title={deleteLabel}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={deleteLabel}
          />
        </Tooltip>
      </Popconfirm>
    </Space>
  )
}


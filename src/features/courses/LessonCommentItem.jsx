import { useMemo, useState } from 'react'
import { Button, Card, Input, Space, Tag, Typography } from 'antd'

import styles from './LessonCommentsPanel.module.css'

const { Text } = Typography

export function LessonCommentItem({
  comment,
  replies,
  onReply,
  onEdit,
  onDelete,
  level = 0,
}) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [editText, setEditText] = useState(comment.content)

  const roleColor = useMemo(() => {
    if (comment.userRole === 'admin')
      return 'red'
    if (comment.userRole === 'teacher')
      return 'blue'
    return 'green'
  }, [comment.userRole])

  async function submitReply() {
    const nextValue = replyText.trim()
    if (!nextValue) return
    await onReply(comment.id, nextValue)
    setReplyText('')
    setReplying(false)
  }

  async function submitEdit() {
    const nextValue = editText.trim()
    if (!nextValue) return
    await onEdit(comment.id, nextValue)
    setEditing(false)
  }

  return (
    <div className={styles.commentNode} style={{ marginLeft: level * 20 }}>
      <Card size="small">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div className={styles.commentHeader}>
            <Space size={8}>
              <Text strong>{comment.userUsername || comment.userEmail}</Text>
              <Tag color={roleColor}>{comment.userRole}</Tag>
            </Space>
            <Text type="secondary">{new Date(comment.createdAt).toLocaleString()}</Text>
          </div>

          {editing ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.TextArea
                rows={3}
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
              />
              <Space>
                <Button type="primary" size="small" onClick={submitEdit}>Save</Button>
                <Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
              </Space>
            </Space>
          ) : (
            <Text type={comment.isDeleted ? 'secondary' : undefined}>
              {comment.content}
            </Text>
          )}

          <Space>
            {!comment.isDeleted && (
              <Button size="small" type="link" onClick={() => setReplying((value) => !value)}>
                Reply
              </Button>
            )}
            {comment.canEdit && !comment.isDeleted && (
              <Button size="small" type="link" onClick={() => setEditing((value) => !value)}>
                Edit
              </Button>
            )}
            {comment.canDelete && !comment.isDeleted && (
              <Button size="small" type="link" danger onClick={() => onDelete(comment.id)}>
                Delete
              </Button>
            )}
          </Space>

          {replying && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.TextArea
                rows={2}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="Write a reply..."
              />
              <Space>
                <Button type="primary" size="small" onClick={submitReply}>Post reply</Button>
                <Button size="small" onClick={() => setReplying(false)}>Cancel</Button>
              </Space>
            </Space>
          )}
        </Space>
      </Card>

      {replies.map((reply) => (
        <LessonCommentItem
          key={reply.id}
          comment={reply}
          replies={reply.replies || []}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      ))}
    </div>
  )
}

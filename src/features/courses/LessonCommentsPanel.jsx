import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Input, Space, Spin, Typography } from 'antd'

import { getApiErrorMessage } from '../../utils/apiError'
import {
  createLessonCommentAPI,
  deleteLessonCommentAPI,
  getLessonCommentsAPI,
  updateLessonCommentAPI,
} from './lessonCommentService'
import { LessonCommentItem } from './LessonCommentItem'
import styles from './LessonCommentsPanel.module.css'

const { Title } = Typography

function buildThread(comments) {
  const nodeMap = new Map()
  comments.forEach((comment) => {
    nodeMap.set(comment.id, { ...comment, replies: [] })
  })

  const roots = []
  comments.forEach((comment) => {
    const node = nodeMap.get(comment.id)
    if (!comment.parentId) {
      roots.push(node)
      return
    }
    const parent = nodeMap.get(comment.parentId)
    if (!parent) {
      roots.push(node)
      return
    }
    parent.replies.push(node)
  })

  return roots
}

export function LessonCommentsPanel({ lessonId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const thread = useMemo(() => buildThread(comments), [comments])

  const loadComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await getLessonCommentsAPI(lessonId)
      setComments(rows)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load comments'))
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  async function createTopLevelComment() {
    const content = draft.trim()
    if (!content) return
    setSubmitting(true)
    try {
      await createLessonCommentAPI({ lesson: lessonId, content })
      setDraft('')
      await loadComments()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create comment'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReply(parentId, content) {
    try {
      await createLessonCommentAPI({
        lesson: lessonId,
        parent: parentId,
        content,
      })
      await loadComments()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reply'))
    }
  }

  async function handleEdit(commentId, content) {
    try {
      await updateLessonCommentAPI(commentId, { content })
      await loadComments()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to edit comment'))
    }
  }

  async function handleDelete(commentId) {
    try {
      await deleteLessonCommentAPI(commentId)
      await loadComments()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete comment'))
    }
  }

  return (
    <Card className={styles.panel}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>Discussion</Title>
        {error && <Alert type="error" showIcon message={error} />}

        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.TextArea
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a comment..."
          />
          <Button type="primary" loading={submitting} onClick={createTopLevelComment}>
            Post comment
          </Button>
        </Space>

        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : (
          <div className={styles.thread}>
            {thread.map((comment) => (
              <LessonCommentItem
                key={comment.id}
                comment={comment}
                replies={comment.replies || []}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Space>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Modal, Form, Input, Spin, message } from 'antd'
import { PlusOutlined, FolderOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { getFoldersAPI, createFolderAPI } from './flashcardService'
import { applyFormApiError, getApiErrorMessage, parseApiError } from '../../utils/apiError'
import { formatDate } from '../../utils/formatDate'
import styles from './FoldersPage.module.css'

export function FoldersPage() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  async function loadFolders() {
    setLoading(true)
    try {
      const list = await getFoldersAPI()
      setFolders(list)
    } catch (err) {
      const msg = err instanceof Error && err.message && !err.response
        ? err.message
        : getApiErrorMessage(err, 'Failed to load folders')
      message.error(msg)
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFolders()
  }, [])

  async function handleCreate(values) {
    setSubmitting(true)
    try {
      await createFolderAPI({ name: values.name })
      message.success('Folder created!')
      setModalOpen(false)
      form.resetFields()
      loadFolders()
    } catch (err) {
      const parsedError = parseApiError(err, 'Failed to create folder')
      applyFormApiError(form, parsedError)
      message.error(parsedError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Folders</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          className={styles.createBtn}
        >
          Create Folder
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : folders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📁</div>
          <p className={styles.emptyText}>No folders yet</p>
          <p className={styles.emptySubtext}>Create a folder to organize your flashcards</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            className={clsx(styles.createBtn, styles.createBtn)}
            style={{ marginTop: 16 }}
          >
            Create Your First Folder
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {folders.map((folder) => (
            <Link
              key={folder.id}
              to={`/flashcards/${folder.id}`}
              className={styles.card}
            >
              <div className={styles.cardName}>
                <FolderOutlined style={{ marginRight: 8 }} />
                {folder.name}
              </div>
              <div className={styles.cardMeta}>
                {folder.flashcardCount} cards
                {folder.createdAt && ` · ${formatDate(folder.createdAt)}`}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        title="Create Folder"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Folder Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="e.g. Travel Vocabulary" size="large" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting} className={styles.createBtn}>
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

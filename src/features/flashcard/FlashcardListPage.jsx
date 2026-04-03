import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spin, message, Popconfirm } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getFoldersAPI,
  getFlashcardsAPI,
  deleteFlashcardAPI,
} from './flashcardService'
import { FlashcardForm } from './FlashcardForm'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './FlashcardListPage.module.css'

export function FlashcardListPage() {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const [folder, setFolder] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [folderMissing, setFolderMissing] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    setFolderMissing(false)
    setFolder(null)
    try {
      const [folders, cards] = await Promise.all([
        getFoldersAPI(),
        getFlashcardsAPI(folderId),
      ])
      const match = folders.find((f) => String(f.id) === String(folderId))
      if (!match) {
        setFolderMissing(true)
        setFlashcards([])
        return
      }
      setFolder(match)
      setFlashcards(cards)
    } catch (err) {
      const msg =
        err instanceof Error && err.message && !err.response
          ? err.message
          : getApiErrorMessage(err, 'Failed to load')
      setLoadError(msg)
      message.error(msg)
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [folderId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleDelete(id, event) {
    event?.stopPropagation?.()
    try {
      await deleteFlashcardAPI(id)
      message.success('Card deleted')
      loadData()
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Delete failed')
      message.error(msg)
    }
  }

  function handleEdit(id, event) {
    event?.stopPropagation?.()
    const card = flashcards.find((c) => String(c.id) === String(id))
    setEditingCard(card ?? null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingCard(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/flashcards')} aria-label="Back">
          <ArrowLeftOutlined />
        </button>
        <h1 className={styles.title}>{folder?.name || 'Flashcards'}</h1>
        <Button
          type="default"
          onClick={() => navigate(`/review?folderId=${folderId}`)}
          className={styles.reviewBtn}
          disabled={!!loadError || folderMissing || !folder}
        >
          Review Folder
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFormOpen(true)}
          className={styles.addBtn}
          disabled={!!loadError || folderMissing || !folder}
        >
          Add Card
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : loadError ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Could not load this folder</p>
          <p className={styles.emptySubtext}>{loadError}</p>
          <Button type="primary" onClick={() => loadData()} className={styles.addBtn} style={{ marginTop: 16 }}>
            Retry
          </Button>
        </div>
      ) : folderMissing ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Folder not found</p>
          <p className={styles.emptySubtext}>
            This folder does not exist or you do not have access.
          </p>
          <Button type="primary" onClick={() => navigate('/flashcards')} className={styles.addBtn} style={{ marginTop: 16 }}>
            Back to folders
          </Button>
        </div>
      ) : flashcards.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🃏</div>
          <p className={styles.emptyText}>No flashcards yet</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormOpen(true)}
            className={styles.addBtn}
            style={{ marginTop: 16 }}
          >
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {flashcards.map((card) => (
            <div
              key={card.id}
              className={styles.card}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFace}>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => handleEdit(card.id, e)}
                    >
                      <EditOutlined />
                    </button>
                    <Popconfirm
                      title="Delete this card?"
                      onConfirm={() => handleDelete(card.id)}
                      onCancel={(e) => e?.stopPropagation?.()}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                    >
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteOutlined />
                      </button>
                    </Popconfirm>
                  </div>
                  <span className={styles.frontText}>{card.frontText || 'No front text'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FlashcardForm
        open={formOpen}
        onClose={closeForm}
        folderId={folderId}
        initialValues={editingCard}
        onSuccess={loadData}
      />
    </div>
  )
}

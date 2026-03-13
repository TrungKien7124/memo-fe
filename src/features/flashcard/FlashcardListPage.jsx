import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spin, message, Popconfirm } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import clsx from 'clsx'
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
  const [formOpen, setFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [flippedIds, setFlippedIds] = useState(new Set())

  async function loadData() {
    setLoading(true)
    try {
      const [foldersData, cardsData] = await Promise.all([
        getFoldersAPI(),
        getFlashcardsAPI(folderId),
      ])
      const folders = Array.isArray(foldersData) ? foldersData : foldersData?.results || []
      setFolder(folders.find((f) => String(f.id) === String(folderId)) || { id: folderId, name: 'Folder' })
      setFlashcards(Array.isArray(cardsData) ? cardsData : cardsData?.results || [])
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load')
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [folderId])

  function handleFlip(id) {
    setFlippedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
    setEditingCard(flashcards.find((c) => c.id === id))
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
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFormOpen(true)}
          className={styles.addBtn}
        >
          Add Card
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
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
              className={clsx(styles.card, flippedIds.has(card.id) && styles.cardFlipped)}
              onClick={() => handleFlip(card.id)}
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
                  <span className={styles.frontText}>{card.front || 'No front text'}</span>
                </div>
                <div className={clsx(styles.cardFace, styles.cardBack)}>
                  <span className={styles.frontText}>{card.back || 'No back text'}</span>
                  {card.ipa && <span className={styles.ipa}>{card.ipa}</span>}
                  {card.example_sentence && (
                    <span className={styles.backText} style={{ marginTop: 8 }}>
                      {card.example_sentence}
                    </span>
                  )}
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

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spin, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import {
  createReviewSessionAPI,
  getDueCardsAPI,
  submitCardReviewAPI,
  endReviewSessionAPI,
} from './reviewService'
import { getApiErrorMessage } from '../../utils/apiError'
import styles from './ReviewSessionPage.module.css'

const RATING_EASY = 'easy'
const RATING_GOOD = 'good'
const RATING_HARD = 'hard'

export function ReviewSessionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)
  const [completionError, setCompletionError] = useState(null)
  const [isCompletingSession, setIsCompletingSession] = useState(false)
  const [completion, setCompletion] = useState(null)

  const startSession = useCallback(async () => {
    setLoading(true)
    try {
      const session = await createReviewSessionAPI()
      setSessionId(session.id)
      const cardList = await getDueCardsAPI()
      setCards(cardList)
      setCurrentIndex(0)
      setFlipped(false)
      setFeedback(null)
      setDone(false)
      setCompletionError(null)
      setIsCompletingSession(false)
      setCompletion(null)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to start review')
      message.error(msg)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    startSession()
  }, [startSession])

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + (flipped ? 1 : 0)) / cards.length) * 100 : 0
  const isLastCard = currentIndex >= cards.length - 1 && flipped

  async function finalizeSession() {
    if (!sessionId) return

    try {
      const sessionSummary = await endReviewSessionAPI(sessionId)
      setCompletionError(null)
      setCompletion(sessionSummary)
      setDone(true)
    } catch (err) {
      setCompletionError(getApiErrorMessage(err, 'Review completion could not be confirmed'))
    }
  }

  async function handleRating(rating) {
    if (!currentCard || !sessionId || isCompletingSession) return

    setFeedback(rating)
    setCompletionError(null)

    try {
      await submitCardReviewAPI({
        sessionId,
        cardId: currentCard.id,
        rating,
      })
    } catch (err) {
      setFeedback(null)
      message.error(getApiErrorMessage(err, 'Failed to submit'))
      return
    }

    if (isLastCard) {
      setIsCompletingSession(true)
      await finalizeSession()
    } else {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
      setFeedback(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.page} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (cards.length === 0 && !done) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.exitBtn} onClick={() => navigate(-1)} aria-label="Exit">
            <CloseOutlined />
          </button>
        </div>
        <div className={styles.main}>
          <div className={styles.noCards}>
            <h2 className={styles.noCardsTitle}>No cards to review!</h2>
            <p className={styles.noCardsText}>Come back later or add more flashcards.</p>
            <Button type="primary" onClick={() => navigate('/flashcards')} className={styles.ratingBtn}>
              Go to Flashcards
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    const cardsReviewed = completion?.cardsReviewed ?? 0
    const xpEarned = completion?.xpEarned ?? 0
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.exitBtn} onClick={() => navigate(-1)} aria-label="Exit">
            <CloseOutlined />
          </button>
        </div>
        <div className={styles.main}>
          <div className={styles.resultScreen}>
            <h1 className={styles.resultTitle}>Review Complete! 🎉</h1>
            <p className={styles.resultSubtitle}>Great job!</p>
            <div className={styles.xpEarned}>+{xpEarned} XP</div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{cardsReviewed}</div>
                <div className={styles.statLabel}>Cards reviewed</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>N/A</div>
                <div className={styles.statLabel}>Accuracy</div>
              </div>
            </div>
            <div className={styles.resultActions}>
              <Button className={clsx(styles.resultBtn, styles.resultPrimary)} onClick={startSession}>
                Practice Again
              </Button>
              <Button className={clsx(styles.resultBtn, styles.resultSecondary)} onClick={() => navigate(-1)}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const showRating = flipped && !done
  const cardClass = feedback === RATING_EASY ? styles.cardCorrect : feedback === RATING_HARD ? styles.cardHard : ''

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={() => navigate(-1)} aria-label="Exit">
          <CloseOutlined />
        </button>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.counter}>
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div className={styles.main}>
        {completionError && (
          <div style={{ marginBottom: 'var(--space-6)', color: 'var(--color-error)', fontWeight: 600 }}>
            {completionError}
          </div>
        )}
        <div className={clsx(styles.cardArea, cardClass)}>
          <div
            className={clsx(styles.card, flipped && styles.cardFlipped)}
            onClick={() => !showRating && setFlipped(true)}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFace}>
                <span className={styles.cardText}>
                  {currentCard?.frontText || 'No front'}
                </span>
                <span className={styles.hint}>Tap to flip</span>
              </div>
              <div className={clsx(styles.cardFace, styles.cardBack)}>
                <span className={styles.cardText}>
                  {currentCard?.backText || 'No back'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showRating && (
          isCompletingSession ? (
            <div className={styles.ratingArea}>
              <Button type="primary" className={styles.ratingBtn} onClick={finalizeSession}>
                Retry Finish Session
              </Button>
            </div>
          ) : (
            <div className={styles.ratingArea}>
              <button
                type="button"
                className={clsx(styles.ratingBtn, styles.ratingEasy)}
                onClick={() => handleRating(RATING_EASY)}
              >
                EASY
              </button>
              <button
                type="button"
                className={clsx(styles.ratingBtn, styles.ratingGood)}
                onClick={() => handleRating(RATING_GOOD)}
              >
                GOOD
              </button>
              <button
                type="button"
                className={clsx(styles.ratingBtn, styles.ratingHard)}
                onClick={() => handleRating(RATING_HARD)}
              >
                HARD
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

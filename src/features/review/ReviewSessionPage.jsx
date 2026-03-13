import { useState, useEffect } from 'react'
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

const XP_PER_RATING = { easy: 15, good: 10, hard: 5 }

export function ReviewSessionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState({ xp: 0, reviewed: 0, correct: 0 })

  async function startSession() {
    setLoading(true)
    try {
      const session = await createReviewSessionAPI()
      setSessionId(session?.id)
      const dueData = await getDueCardsAPI()
      const cardList = Array.isArray(dueData) ? dueData : dueData?.results || []
      setCards(cardList)
      setCurrentIndex(0)
      setFlipped(false)
      setFeedback(null)
      setDone(false)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to start review')
      message.error(msg)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    startSession()
  }, [])

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + (flipped ? 1 : 0)) / cards.length) * 100 : 0
  const isLastCard = currentIndex >= cards.length - 1 && flipped

  async function handleRating(rating) {
    if (!currentCard || !sessionId) return

    setFeedback(rating)

    try {
      await submitCardReviewAPI({
        session: sessionId,
        card: currentCard.id ?? currentCard.card,
        rating,
      })
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to submit'))
    }

    const xp = XP_PER_RATING[rating] ?? 10
    setResult((prev) => ({
      xp: prev.xp + xp,
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (rating === RATING_EASY || rating === RATING_GOOD ? 1 : 0),
    }))

    if (isLastCard) {
      try {
        await endReviewSessionAPI(sessionId, {
          xp_earned: result.xp + xp,
          cards_reviewed: result.reviewed + 1,
        })
      } catch {
        // ignore
      }
      setDone(true)
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
    const accuracy = result.reviewed > 0 ? Math.round((result.correct / result.reviewed) * 100) : 0
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
            <div className={styles.xpEarned}>+{result.xp} XP</div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{result.reviewed}</div>
                <div className={styles.statLabel}>Cards reviewed</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{accuracy}%</div>
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
        <div className={clsx(styles.cardArea, cardClass)}>
          <div
            className={clsx(styles.card, flipped && styles.cardFlipped)}
            onClick={() => !showRating && setFlipped(true)}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFace}>
                <span className={styles.cardText}>
                  {currentCard?.flashcard?.front ?? currentCard?.front ?? 'No front'}
                </span>
                <span className={styles.hint}>Tap to flip</span>
              </div>
              <div className={clsx(styles.cardFace, styles.cardBack)}>
                <span className={styles.cardText}>
                  {currentCard?.flashcard?.back ?? currentCard?.back ?? 'No back'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showRating && (
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
        )}
      </div>
    </div>
  )
}

import axiosClient from '../../services/axiosClient'

/**
 * Fetch XP summary for gamification.
 * @returns {Promise<{data: Object}>}
 */
export async function getXPSummaryAPI() {
  const { data } = await axiosClient.get('/api/gamification/xp-summary/')
  return data
}

/**
 * Fetch count of cards due for review today.
 * @returns {Promise<{data: Array, count?: number}>}
 */
export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/srs/card-srs/', {
    params: { due_date__lte: today },
  })
  return data
}

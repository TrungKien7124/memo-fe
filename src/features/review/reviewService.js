import axiosClient from '../../services/axiosClient'

export async function createReviewSessionAPI() {
  const { data } = await axiosClient.post('/api/rse/review-sessions/')
  return data
}

export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/srs/card-srs/', {
    params: { due_date__lte: today },
  })
  return data
}

export async function submitCardReviewAPI(data) {
  const { data: result } = await axiosClient.post('/api/rse/card-review-logs/', data)
  return result
}

export async function endReviewSessionAPI(id, data) {
  const { data: result } = await axiosClient.patch(`/api/rse/review-sessions/${id}/`, data)
  return result
}

export async function getReviewHistoryAPI() {
  const { data } = await axiosClient.get('/api/rse/review-sessions/')
  return data
}

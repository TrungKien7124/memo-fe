import axiosClient from '../../services/axiosClient'

export async function getXPSummaryAPI() {
  const { data } = await axiosClient.get('/api/gms/xp/')
  return data
}

export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/srs/card-srs/', {
    params: { due_date__lte: today },
  })
  return data
}

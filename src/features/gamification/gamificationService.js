import axiosClient from '../../services/axiosClient'

export async function getLeaderboardAPI() {
  const { data } = await axiosClient.get('/api/gamification/leaderboard/')
  return data
}

export async function getProfileStatsAPI() {
  const { data } = await axiosClient.get('/api/gamification/xp-summary/')
  return data
}

import axiosClient from '../../services/axiosClient'

export async function getLeaderboardAPI() {
  const { data } = await axiosClient.get('/api/gms/leaderboard/')
  return data
}

export async function getProfileStatsAPI() {
  const { data } = await axiosClient.get('/api/gms/xp/')
  return data
}

import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

function toLeaderboardEntryDTO(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry))
    throw new Error('Invalid leaderboard entry payload')

  return {
    id: entry.id != null ? String(entry.id) : null,
    email: entry.email != null ? String(entry.email) : null,
    username: entry.username != null ? String(entry.username) : null,
    xp: entry.xp != null ? Number(entry.xp) : null,
    totalXp: entry.total_xp != null ? Number(entry.total_xp) : null,
  }
}

export async function getLeaderboardAPI() {
  const { data } = await axiosClient.get('/api/leaderboard/')
  const rows = parseListPayload(data, 'leaderboard list')
  return rows.map((row) => {
    const dto = toLeaderboardEntryDTO(row)
    return {
      ...dto,
      xp: dto.xp ?? dto.totalXp ?? 0,
      totalXp: dto.totalXp ?? dto.xp ?? 0,
    }
  })
}

export async function getProfileStatsAPI() {
  const { data } = await axiosClient.get('/api/xp/')
  const responseData = assertSuccessEnvelope(data, 'profile stats')
  return {
    totalXp: responseData.total_xp ?? null,
    weeklyXp: responseData.weekly_xp ?? null,
    monthlyXp: responseData.monthly_xp ?? null,
    dailyGoal: responseData.daily_goal ?? null,
    todayXp: responseData.today_xp ?? null,
    streak: responseData.streak ?? null,
    lastSevenDays: responseData.last_seven_days ?? [],
  }
}

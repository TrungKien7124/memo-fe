import axiosClient from '../../services/axiosClient'

function parseDetailDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data))
    throw new Error(`Missing data object in ${endpoint} response`)
  return payload.data
}

function parseListDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!Array.isArray(payload.data))
    throw new Error(`Missing data list in ${endpoint} response`)
  return payload.data
}

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
  const { data } = await axiosClient.get('/api/gms/leaderboard/')
  const rows = parseListDataEnvelope(data, 'leaderboard list')
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
  const { data } = await axiosClient.get('/api/gms/xp/')
  const responseData = parseDetailDataEnvelope(data, 'profile stats')
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

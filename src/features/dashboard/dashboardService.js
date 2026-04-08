import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope, parseListPayload } from '../../utils/apiEnvelope'

export async function getXPSummaryAPI() {
  const { data } = await axiosClient.get('/api/xp/')
  const responseData = assertSuccessEnvelope(data, 'xp summary')
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

export async function getDueCardsAPI() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await axiosClient.get('/api/card-repetition-states/', {
    params: { due_date__lte: today },
  })
  return parseListPayload(data, 'due cards list')
}

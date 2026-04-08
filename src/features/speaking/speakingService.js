import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope } from '../../utils/apiEnvelope'

export async function createSpeakingSessionAPI(data) {
  const { data: body } = await axiosClient.post('/api/speaking-sessions/', data)
  return assertSuccessEnvelope(body, 'speaking session create')
}

export async function sendSpeakingTurnAPI(data) {
  const { data: body } = await axiosClient.post('/api/speaking-turns/', data)
  return assertSuccessEnvelope(body, 'speaking turn')
}

export async function endSpeakingSessionAPI(sessionId) {
  const { data: body } = await axiosClient.post(`/api/speaking-sessions/${sessionId}/end/`)
  return assertSuccessEnvelope(body, 'speaking session end')
}

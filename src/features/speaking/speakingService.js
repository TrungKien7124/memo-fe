import axiosClient from '../../services/axiosClient'

export async function createSpeakingSessionAPI(data) {
  const { data: result } = await axiosClient.post('/api/sps/sessions/', data)
  return result
}

export async function sendSpeakingTurnAPI(data) {
  const { data: result } = await axiosClient.post('/api/sps/speak/', data)
  return result
}

export async function endSpeakingSessionAPI(sessionId) {
  const { data: result } = await axiosClient.post(`/api/sps/sessions/${sessionId}/end/`)
  return result
}

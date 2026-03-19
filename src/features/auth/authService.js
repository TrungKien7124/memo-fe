import axiosClient from '../../services/axiosClient'

function parseDetailDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data))
    throw new Error(`Missing data object in ${endpoint} response`)
  return payload.data
}

export function loginAPI(credentials) {
  return axiosClient.post('/api/auth/login/', credentials).then(({ data }) => {
    const responseData = parseDetailDataEnvelope(data, 'login')
    return {
      user: responseData.user,
      tokens: responseData.tokens,
    }
  })
}

export function registerAPI(data) {
  return axiosClient.post('/api/auth/register/', data).then(({ data: responseBody }) => {
    const responseData = parseDetailDataEnvelope(responseBody, 'register')
    return {
      user: responseData.user,
      tokens: responseData.tokens,
    }
  })
}

export function refreshTokenAPI(refresh) {
  return axiosClient.post('/api/auth/refresh/', { refresh }).then(({ data }) => {
    const responseData = parseDetailDataEnvelope(data, 'refresh')
    return {
      access: responseData.access,
      refresh: responseData.refresh,
    }
  })
}

export function getProfileAPI() {
  return axiosClient.get('/api/iam/profiles/').then(({ data }) => parseDetailDataEnvelope(data, 'profile'))
}

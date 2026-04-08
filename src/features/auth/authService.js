import axiosClient from '../../services/axiosClient'
import { assertSuccessEnvelope } from '../../utils/apiEnvelope'

export function loginAPI(credentials) {
  return axiosClient.post('/api/auth/login/', credentials).then(({ data }) => {
    const responseData = assertSuccessEnvelope(data, 'login')
    return {
      user: responseData.user,
      tokens: responseData.tokens,
    }
  })
}

export function registerAPI(data) {
  return axiosClient.post('/api/auth/register/', data).then(({ data: responseBody }) => {
    const responseData = assertSuccessEnvelope(responseBody, 'register')
    return {
      user: responseData.user,
      tokens: responseData.tokens,
    }
  })
}

export function refreshTokenAPI(refresh) {
  return axiosClient.post('/api/auth/refresh/', { refresh }).then(({ data }) => {
    const responseData = assertSuccessEnvelope(data, 'refresh')
    return {
      access: responseData.access,
      refresh: responseData.refresh,
    }
  })
}

export function getProfileAPI() {
  return axiosClient.get('/api/users/profile/').then(({ data }) => assertSuccessEnvelope(data, 'profile'))
}

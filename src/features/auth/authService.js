import axiosClient from '../../services/axiosClient'

export function loginAPI(credentials) {
  return axiosClient.post('/api/auth/login/', credentials)
}

export function registerAPI(data) {
  return axiosClient.post('/api/auth/register/', data)
}

export function refreshTokenAPI(refresh) {
  return axiosClient.post('/api/auth/refresh/', { refresh })
}

export function getProfileAPI() {
  return axiosClient.get('/api/iam/profiles/')
}

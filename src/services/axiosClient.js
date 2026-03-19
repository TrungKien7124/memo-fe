import axios from 'axios'
import { store } from '../app/store'
import { logout, tokenRefreshed } from '../features/auth/authSlice'
import { API_URL } from '../utils/constants'

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_URL}/api/auth/refresh/`, { refresh })
        const accessToken = data.data?.access
        const refreshToken = data.data?.refresh
        if (!accessToken) throw new Error('Invalid refresh response format')
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
        store.dispatch(tokenRefreshed({ access: accessToken, refresh: refreshToken }))

        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosClient(originalRequest)
      } catch (err) {
        processQueue(err, null)
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient

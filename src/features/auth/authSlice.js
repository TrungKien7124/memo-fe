import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { user, access, refresh } = action.payload
      state.user = user
      state.accessToken = access
      state.refreshToken = refresh
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(user))
    },
    tokenRefreshed(state, action) {
      state.accessToken = action.payload.access
      state.isAuthenticated = Boolean(action.payload.access)
      localStorage.setItem('access_token', action.payload.access)
      if (action.payload.refresh) {
        state.refreshToken = action.payload.refresh
        localStorage.setItem('refresh_token', action.payload.refresh)
      }
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
    setError(state, action) {
      state.error = action.payload
      state.status = 'failed'
    },
    setLoading(state) {
      state.status = 'loading'
      state.error = null
    },
    setIdle(state) {
      state.status = 'idle'
    },
  },
})

export const { loginSuccess, tokenRefreshed, logout, setError, setLoading, setIdle } = authSlice.actions
export default authSlice.reducer

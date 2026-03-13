import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { USER_ROLES } from '../utils/constants'

export function AdminRoute() {
  const user = useSelector((state) => state.auth?.user)

  if (!user)
    return <Navigate to="/login" replace />

  if (user.role !== USER_ROLES.ADMIN)
    return <Navigate to="/dashboard" replace />

  return <Outlet />
}

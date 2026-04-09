import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { isAdminRole } from '../utils/roleRouting'

export function AdminRoute() {
  const user = useSelector((state) => state.auth?.user)

  if (!user)
    return <Navigate to="/login" replace />

  if (!isAdminRole(user.role))
    return <Navigate to="/dashboard" replace />

  return <Outlet />
}

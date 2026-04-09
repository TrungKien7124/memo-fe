import { USER_ROLES } from './constants'

export function isAdminRole(role) {
  return role === USER_ROLES.ADMIN
}

export function isTeacherRole(role) {
  return role === USER_ROLES.TEACHER
}

export function getDefaultRouteByRole(role) {
  if (isAdminRole(role)) return '/admin/courses'
  return '/dashboard'
}

import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { MainLayout } from './components/Layout/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { getDefaultRouteByRole } from './utils/roleRouting'

import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CoursesPage } from './features/courses/CoursesPage'
import { CourseDetailPage } from './features/courses/CourseDetailPage'
import { CourseCheckoutPage } from './features/courses/CourseCheckoutPage'
import { LessonPage } from './features/courses/LessonPage'
import { FoldersPage } from './features/flashcard/FoldersPage'
import { FlashcardListPage } from './features/flashcard/FlashcardListPage'
import { ReviewSessionPage } from './features/review/ReviewSessionPage'
import { ReviewHistory } from './features/review/ReviewHistory'
import { SpeakingPage } from './features/speaking/SpeakingPage'
import { SpeakingSession } from './features/speaking/SpeakingSession'
import { LeaderboardPage } from './features/gamification/LeaderboardPage'
import { ProfileStatsPage } from './features/gamification/ProfileStatsPage'
import { AdminCoursesPage } from './features/admin/AdminCoursesPage'
import { AdminCourseDetailPage } from './features/admin/AdminCourseDetailPage'
import { AdminModuleLessonsPage } from './features/admin/AdminModuleLessonsPage'
import { AdminLessonDetailPage } from './features/admin/AdminLessonDetailPage'
import { AdminLessonUploadPage } from './features/admin/AdminLessonUploadPage'

function AdminCourseManagePathRedirect() {
  const { courseId } = useParams()
  const { pathname } = useLocation()
  const sub = pathname.includes('/access') ? 'access' : 'modules'
  return <Navigate to={`/admin/course/detail/${courseId}?sub=${sub}`} replace />
}

function AdminLegacyCourseModulesRedirect() {
  const { courseId } = useParams()
  return <Navigate to={`/admin/course/detail/${courseId}?sub=modules`} replace />
}

function AdminLegacyCourseAccessRedirect() {
  const { courseId } = useParams()
  return <Navigate to={`/admin/course/detail/${courseId}?sub=access`} replace />
}

function AdminLegacyModuleLessonsRedirect() {
  const { moduleId } = useParams()
  return <Navigate to={`/admin/module/detail/${moduleId}?sub=lessons`} replace />
}

function AdminLegacyLessonDetailRedirect() {
  const { lessonId } = useParams()
  return <Navigate to={`/admin/lesson/detail/${lessonId}`} replace />
}

function RoleAwareRootRedirect() {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated)
  const userRole = useSelector((state) => state.auth?.user?.role)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={getDefaultRouteByRole(userRole)} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/checkout" element={<CourseCheckoutPage />} />
          <Route path="/flashcards" element={<FoldersPage />} />
          <Route path="/flashcards/:folderId" element={<FlashcardListPage />} />
          <Route path="/review/history" element={<ReviewHistory />} />
          <Route path="/speaking" element={<SpeakingPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfileStatsPage />} />

        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/courses" replace />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/lesson-upload" element={<AdminLessonUploadPage />} />
            <Route path="/admin/course/detail/:courseId" element={<AdminCourseDetailPage />} />
            <Route path="/admin/module/detail/:moduleId" element={<AdminModuleLessonsPage />} />
            <Route path="/admin/lesson/detail/:lessonId" element={<AdminLessonDetailPage />} />
            <Route path="/admin/courses/:courseId/manage/*" element={<AdminCourseManagePathRedirect />} />
            <Route path="/admin/courses/:courseId/modules" element={<AdminLegacyCourseModulesRedirect />} />
            <Route path="/admin/courses/:courseId/access" element={<AdminLegacyCourseAccessRedirect />} />
            <Route path="/admin/modules/:moduleId/lessons" element={<AdminLegacyModuleLessonsRedirect />} />
            <Route path="/admin/lessons/:lessonId" element={<AdminLegacyLessonDetailRedirect />} />
          </Route>
        </Route>

        {/* Full-screen routes (no sidebar) */}
        <Route path="/courses/:id/lessons/:lessonId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewSessionPage />} />
        <Route path="/speaking/:sessionId" element={<SpeakingSession />} />
      </Route>

      <Route path="/" element={<RoleAwareRootRedirect />} />
      <Route path="*" element={<RoleAwareRootRedirect />} />
    </Routes>
  )
}

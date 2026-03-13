import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/Layout/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminLayout } from './components/admin/AdminLayout'

import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CoursesPage } from './features/courses/CoursesPage'
import { CourseDetailPage } from './features/courses/CourseDetailPage'
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
import { AdminCourseModulesPage } from './features/admin/AdminCourseModulesPage'
import { AdminModuleLessonsPage } from './features/admin/AdminModuleLessonsPage'

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
            <Route path="/admin/courses/:courseId/modules" element={<AdminCourseModulesPage />} />
            <Route path="/admin/modules/:moduleId/lessons" element={<AdminModuleLessonsPage />} />
          </Route>
        </Route>

        {/* Full-screen routes (no sidebar) */}
        <Route path="/courses/:id/lessons/:lessonId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewSessionPage />} />
        <Route path="/speaking/:sessionId" element={<SpeakingSession />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

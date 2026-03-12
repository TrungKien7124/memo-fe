export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const QUESTS = [
  { title: 'Earn 20 XP', value: 20 },
  { title: 'Earn 50 XP', value: 50 },
  { title: 'Earn 100 XP', value: 100 },
  { title: 'Earn 250 XP', value: 250 },
  { title: 'Earn 500 XP', value: 500 },
]

export const REVIEW_RATINGS = {
  EASY: 'easy',
  GOOD: 'good',
  HARD: 'hard',
}

export const SPEAKING_TOPICS = [
  { key: 'ordering_food', label: 'Ordering Food', icon: '🍔', description: 'Practice ordering at a restaurant' },
  { key: 'job_interview', label: 'Job Interview', icon: '💼', description: 'Practice common interview questions' },
  { key: 'travel', label: 'Travel', icon: '✈️', description: 'Practice travel conversations' },
  { key: 'daily_routine', label: 'Daily Routine', icon: '☀️', description: 'Talk about your daily activities' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', description: 'Practice shopping conversations' },
]

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
}

import { useLocation, Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  SyncOutlined,
  AudioOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: HomeOutlined },
  { label: 'Courses', path: '/courses', icon: BookOutlined },
  { label: 'Flashcards', path: '/flashcards', icon: FileTextOutlined },
  { label: 'Review', path: '/review', icon: SyncOutlined },
  { label: 'Speaking', path: '/speaking', icon: AudioOutlined },
  { label: 'Leaderboard', path: '/leaderboard', icon: TrophyOutlined },
  { label: 'Profile', path: '/profile', icon: UserOutlined },
]

export function Sidebar({ className }) {
  const location = useLocation()

  return (
    <div className={clsx(styles.sidebar, className)}>
      <Link to="/dashboard" className={styles.logo}>
        <span className={styles.logoIcon}>📘</span>
        <h1 className={styles.logoText}>MEMO</h1>
      </Link>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(styles.navItem, isActive && styles.navItemActive)}
            >
              <Icon className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

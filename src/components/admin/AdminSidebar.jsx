import clsx from 'clsx'
import { BookOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import styles from './AdminSidebar.module.css'

const ADMIN_NAV_ITEMS = [
  { label: 'Courses', path: '/admin/courses', icon: BookOutlined },
]

export function AdminSidebar({ className, isDrawer = false, onNavigate }) {
  const location = useLocation()

  function handleNavClick() {
    if (typeof onNavigate === 'function')
      onNavigate()
  }

  return (
    <aside className={clsx(styles.sidebar, isDrawer && styles.drawerSidebar, className)}>
      <Link to="/admin/courses" className={styles.logo} onClick={handleNavClick}>
        <span className={styles.logoIcon}>🛠️</span>
        <h1 className={styles.logoText}>MEMO ADMIN</h1>
      </Link>

      <div className={styles.sectionLabel}>
        <SettingOutlined />
        <span>Content Management</span>
      </div>

      <nav className={styles.nav}>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={clsx(styles.navItem, isActive && styles.navItemActive)}
            >
              <Icon className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <Link to="/dashboard" onClick={handleNavClick} className={styles.backToApp}>
          <HomeOutlined className={styles.navIcon} />
          <span>Back to Learning App</span>
        </Link>
      </div>
    </aside>
  )
}

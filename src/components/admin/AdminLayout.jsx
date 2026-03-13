import { useState } from 'react'
import { Avatar, Drawer, Dropdown } from 'antd'
import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { AdminSidebar } from './AdminSidebar'
import styles from './AdminLayout.module.css'

export function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Profile</Link> },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
  ]

  return (
    <div className={styles.wrapper}>
      <header className={styles.mobileHeader}>
        <button className={styles.menuButton} onClick={() => setIsDrawerOpen(true)}>
          <MenuOutlined />
        </button>
        <Link to="/admin/courses" className={styles.mobileLogo}>
          <span>🛠️</span>
          <span className={styles.mobileLogoText}>Admin</span>
        </Link>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Avatar size={32} style={{ backgroundColor: '#2563eb', cursor: 'pointer' }}>
            {user?.first_name?.[0] || user?.username?.[0] || 'A'}
          </Avatar>
        </Dropdown>
      </header>

      <AdminSidebar className={styles.desktopSidebar} />

      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      <Drawer
        placement="left"
        width={280}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <AdminSidebar isDrawer onNavigate={() => setIsDrawerOpen(false)} />
      </Drawer>
    </div>
  )
}

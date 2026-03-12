import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Drawer, Avatar, Dropdown } from 'antd'
import { MenuOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { logout } from '../../features/auth/authSlice'
import { Sidebar } from './Sidebar'
import styles from './Header.module.css'

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
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
    <>
      {/* Mobile header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuButton} onClick={() => setDrawerOpen(true)}>
          <MenuOutlined />
        </button>
        <Link to="/dashboard" className={styles.mobileLogo}>
          <span>📘</span>
          <span className={styles.mobileLogoText}>MEMO</span>
        </Link>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Avatar size={32} style={{ backgroundColor: 'var(--color-primary)', cursor: 'pointer' }}>
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
        </Dropdown>
      </header>

      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={256}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar />
      </Drawer>
    </>
  )
}

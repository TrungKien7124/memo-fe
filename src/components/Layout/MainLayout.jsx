import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <>
      <Header />
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </>
  )
}

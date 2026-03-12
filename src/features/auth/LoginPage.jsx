import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { loginSuccess, setLoading, setError, setIdle } from './authSlice'
import { loginAPI } from './authService'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const [loading, setLocalLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleFinish(values) {
    setLocalLoading(true)
    dispatch(setLoading())
    try {
      const { data } = await loginAPI(values)
      dispatch(loginSuccess({
        user: data.data?.user || data.user,
        access: data.data?.access || data.access,
        refresh: data.data?.refresh || data.refresh,
      }))
      message.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Login failed'
      dispatch(setError(msg))
      message.error(msg)
    } finally {
      setLocalLoading(false)
      dispatch(setIdle())
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>📘</span>
          <h1 className={styles.title}>MEMO</h1>
          <p className={styles.subtitle}>Learn English, your way</p>
        </div>

        <Form layout="vertical" onFinish={handleFinish} size="large" requiredMark={false}>
          <Form.Item name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className={styles.submitBtn}>
              Log In
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

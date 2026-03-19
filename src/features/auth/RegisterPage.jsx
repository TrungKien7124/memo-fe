import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { loginSuccess, setLoading, setError, setIdle } from './authSlice'
import { registerAPI } from './authService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './RegisterPage.module.css'

export function RegisterPage() {
  const [loading, setLocalLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  async function handleFinish(values) {
    setLocalLoading(true)
    dispatch(setLoading())
    try {
      const response = await registerAPI({
        username: values.username,
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
      })
      const user = response?.user
      const access = response?.tokens?.access
      const refresh = response?.tokens?.refresh
      if (!user || !access || !refresh) throw new Error('Invalid register response format')
      dispatch(loginSuccess({
        user,
        access,
        refresh,
      }))
      message.success('Welcome to MEMO!')
      navigate('/dashboard')
    } catch (err) {
      const parsedError = parseApiError(err, 'Registration failed')
      applyFormApiError(form, parsedError)
      dispatch(setError(parsedError.message))
      message.error(parsedError.message)
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
          <h1 className={styles.title}>Join MEMO</h1>
          <p className={styles.subtitle}>Start your English learning journey</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish} size="large" requiredMark={false}>
          <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }, { min: 8, message: 'At least 8 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item name="confirm_password" dependencies={['password']} rules={[
            { required: true, message: 'Please confirm password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve()
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className={styles.submitBtn}>
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

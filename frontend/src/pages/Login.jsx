import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      navigate(user.role === 'ADMIN' ? '/admin' : '/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">QuizPlatform</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:underline font-medium">
              Register
            </Link>
          </p>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
            Default admin: admin@quizplatform.com / Admin@123
          </p>
        </form>
      </div>
    </div>
  )
}

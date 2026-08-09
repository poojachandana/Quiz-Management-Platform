import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

const NAME_PATTERN = /^[A-Za-z\u00C0-\u024F' -]*$/

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [nameError, setNameError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleNameChange = (e) => {
    const value = e.target.value
    if (NAME_PATTERN.test(value)) {
      setForm({ ...form, name: value })
      setNameError('')
    } else {
      setNameError('Name can only contain letters and spaces')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !NAME_PATTERN.test(form.name)) {
      setNameError('Please enter a valid name using letters only')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">QuizPlatform</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Create your student account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="label">Full Name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={handleNameChange}
              placeholder="John Doe"
            />
            {nameError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <PasswordInput
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

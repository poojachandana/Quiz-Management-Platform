import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as authApi from '../api/auth'
import PasswordInput from '../components/PasswordInput'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const handleRequest = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await authApi.forgotPassword({ email })
      setToken(res.data.resetToken || '')
      setMessage('A reset token was generated. In production this would be emailed to you.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await authApi.resetPassword({ token, newPassword })
      setMessage('Password reset successfully! You can now log in.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">QuizPlatform</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Reset your password</p>
        </div>
        <div className="card space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-2 rounded-lg">{error}</div>}
          {message && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm px-4 py-2 rounded-lg">{message}</div>}

          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full">Send Reset Token</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">Reset Token</label>
                <input
                  required
                  className="input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <PasswordInput
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full">Reset Password</button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to="/login" className="text-brand-600 hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

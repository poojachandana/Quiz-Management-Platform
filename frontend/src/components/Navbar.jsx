import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const isAdmin = user.role === 'ADMIN'
  const base = isAdmin ? '/admin' : '/student'

  const links = isAdmin
    ? [
        { to: `${base}`, label: 'Dashboard' },
        { to: `${base}/quizzes`, label: 'Quizzes' },
        { to: `${base}/categories`, label: 'Categories' },
        { to: `${base}/students`, label: 'Students' },
        { to: `${base}/results`, label: 'Results' },
        { to: `${base}/analytics`, label: 'Analytics' },
        { to: `${base}/leaderboard`, label: 'Leaderboard' },
      ]
    : [
        { to: `${base}`, label: 'Dashboard' },
        { to: `${base}/quizzes`, label: 'Quizzes' },
        { to: `${base}/history`, label: 'History' },
        { to: `${base}/leaderboard`, label: 'Leaderboard' },
      ]

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to={base} className="text-xl font-bold text-brand-600">
              QuizPlatform
            </Link>
            <div className="hidden md:flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.to
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              )}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
              {user.name} <span className="text-xs text-slate-400 dark:text-slate-500">({user.role})</span>
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                location.pathname === link.to
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import * as attemptsApi from '../../api/attempts'

export default function Dashboard() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    attemptsApi.getMyAttempts()
      .then((res) => setAttempts(res.data))
      .finally(() => setLoading(false))
  }, [])

  const completed = attempts.filter((a) => a.status !== 'IN_PROGRESS')
  const passed = completed.filter((a) => a.status === 'PASSED').length
  const failed = completed.filter((a) => a.status === 'FAILED').length
  const avgScore = completed.length
    ? (completed.reduce((s, a) => s + a.percentage, 0) / completed.length).toFixed(1)
    : 0
  const highestScore = completed.length
    ? Math.max(...completed.map((a) => a.percentage)).toFixed(1)
    : 0
  const totalQuestions = completed.reduce(
    (s, a) => s + a.correctAnswers + a.incorrectAnswers + a.unanswered, 0
  )

  const stats = [
    { label: 'Quizzes Attempted', value: completed.length, color: 'text-brand-600' },
    { label: 'Average Score', value: `${avgScore}%`, color: 'text-blue-600' },
    { label: 'Highest Score', value: `${highestScore}%`, color: 'text-green-600 dark:text-green-400' },
    { label: 'Passed', value: passed, color: 'text-green-600 dark:text-green-400' },
    { label: 'Failed', value: failed, color: 'text-red-600 dark:text-red-400' },
    { label: 'Questions Answered', value: totalQuestions, color: 'text-slate-600 dark:text-slate-300' },
  ]

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Here's an overview of your quiz activity.</p>

      {loading ? (
        <div className="text-slate-400 dark:text-slate-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="card text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Recent Attempts</h2>
              <Link to="/student/history" className="text-sm text-brand-600 hover:underline">
                View all
              </Link>
            </div>
            {completed.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                No quizzes attempted yet.{' '}
                <Link to="/student/quizzes" className="text-brand-600 hover:underline">
                  Browse quizzes
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {completed.slice(0, 5).map((a) => (
                  <Link
                    key={a.id}
                    to={`/student/result/${a.id}`}
                    className="flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-slate-700 -mx-2 px-2 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{a.quiz.title}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(a.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{a.percentage}%</span>
                      <span
                        className={`badge ${
                          a.status === 'PASSED' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import * as adminApi from '../../api/admin'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminApi.getAnalytics().then((res) => setStats(res.data))
  }, [])

  const cards = stats ? [
    { label: 'Total Students', value: stats.totalStudents },
    { label: 'Total Quizzes', value: stats.totalQuizzes },
    { label: 'Published Quizzes', value: stats.publishedQuizzes },
    { label: 'Draft Quizzes', value: stats.draftQuizzes },
    { label: 'Total Questions', value: stats.totalQuestions },
    { label: 'Total Attempts', value: stats.totalAttempts },
    { label: 'Average Score', value: `${stats.averageScore}%` },
    { label: 'Passed', value: stats.totalPassed },
    { label: 'Failed', value: stats.totalFailed },
  ] : []

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Admin Dashboard</h1>
      {!stats ? (
        <div className="text-slate-400 dark:text-slate-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="card text-center">
              <div className="text-2xl font-bold text-brand-600">{c.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

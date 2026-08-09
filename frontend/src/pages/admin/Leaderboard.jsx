import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import * as leaderboardApi from '../../api/leaderboard'
import * as categoriesApi from '../../api/categories'

export default function AdminLeaderboard() {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [period, setPeriod] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (period) params.period = period
    if (categoryId) params.categoryId = categoryId
    if (sortBy) params.sortBy = sortBy
    leaderboardApi.getLeaderboard(params)
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false))
  }, [period, categoryId, sortBy])

  return (
    <Layout>
      <div className="flex justify-between items-center mb-2 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Leaderboard Management</h1>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-40" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input w-40" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="">Overall</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
          <select className="input w-44" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="averageScore">Rank by Average Score</option>
            <option value="highestScore">Rank by Highest Score</option>
            <option value="quizzesCompleted">Rank by Quizzes Completed</option>
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        This is a live, computed view of student rankings across the platform — filter it the same
        way students see it to monitor engagement by category or time period.
      </p>

      {loading ? (
        <div className="text-slate-400 dark:text-slate-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="card text-center py-12 text-slate-400 dark:text-slate-500">No leaderboard data yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Avg Score</th>
                <th className="pb-3 font-medium">Highest</th>
                <th className="pb-3 font-medium">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((r) => (
                <tr key={r.studentId}>
                  <td className="py-3 font-bold text-slate-500 dark:text-slate-400">#{r.rank}</td>
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{r.studentName}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-200">{r.averageScore}%</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{r.highestScore}%</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{r.quizzesCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

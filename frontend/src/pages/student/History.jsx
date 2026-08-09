import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as attemptsApi from '../../api/attempts'

export default function History() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    attemptsApi.getMyAttempts()
      .then((res) => setAttempts(res.data.filter((a) => a.status !== 'IN_PROGRESS')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Attempt History</h1>
      {loading ? (
        <div className="text-slate-400 dark:text-slate-500">Loading...</div>
      ) : attempts.length === 0 ? (
        <div className="card text-center py-12 text-slate-400 dark:text-slate-500">No attempts yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-3 font-medium">Quiz</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{a.quiz.title}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(a.completedAt).toLocaleDateString()}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-200">{a.percentage}%</td>
                  <td className="py-3">
                    <span className={`badge ${a.status === 'PASSED' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/student/result/${a.id}`} className="text-brand-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

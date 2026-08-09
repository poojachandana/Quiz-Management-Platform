import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import * as adminApi from '../../api/admin'

export default function Results() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    adminApi.getAllAttemptsAdmin()
      .then((res) => setAttempts(res.data))
      .finally(() => setLoading(false))
  }, [])

  const openDetail = async (id) => {
    setSelected(id)
    const res = await adminApi.getAttemptAdmin(id)
    setDetail(res.data)
  }

  const completed = attempts.filter((a) => a.status !== 'IN_PROGRESS')

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Quiz Results</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-slate-400 dark:text-slate-500">Loading...</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Quiz</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {completed.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => openDetail(a.id)}
                      className={`cursor-pointer ${selected === a.id ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{a.user.name}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{a.quiz.title}</td>
                      <td className="py-3">{a.percentage}%</td>
                      <td className="py-3">
                        <span className={`badge ${a.status === 'PASSED' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 dark:text-slate-500">{new Date(a.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {completed.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">No completed attempts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          {detail ? (
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{detail.attempt.user.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{detail.attempt.quiz.title}</p>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{detail.attempt.correctAnswers}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Correct</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{detail.attempt.incorrectAnswers}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Incorrect</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-500 dark:text-slate-400">{detail.attempt.unanswered}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Skipped</div>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detail.answers.map((a, i) => (
                  <div key={a.id} className="text-sm border-b border-slate-50 dark:border-slate-700 pb-2">
                    <p className="text-slate-700 dark:text-slate-200">{i + 1}. {a.question.questionText}</p>
                    <p className={a.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {a.selectedOption ? a.selectedOption.optionText : '(unanswered)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              Select a result to view details
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

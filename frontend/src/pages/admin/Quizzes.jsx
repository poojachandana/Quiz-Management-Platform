import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as quizzesApi from '../../api/quizzes'

const statusColors = {
  PUBLISHED: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  DRAFT: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  UNPUBLISHED: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
}

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await quizzesApi.getAllQuizzesAdmin()

      console.log('Admin quizzes response:', res.data)

      setQuizzes(res.data)
    } catch (err) {
      console.error('Failed to load admin quizzes:', err)
      console.error('Response:', err.response?.data)

      setError(
          err.response?.data?.message ||
          `Failed to load quizzes (${err.response?.status || 'Unknown error'})`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handlePublishToggle = async (quiz) => {
    const nextStatus = quiz.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED'
    try {
      await quizzesApi.publishQuiz(quiz.id, nextStatus)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz and all its questions?')) return
    await quizzesApi.deleteQuiz(id)
    load()
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Quizzes</h1>
        <Link to="/admin/quizzes/new" className="btn-primary">+ New Quiz</Link>
      </div>

      {loading ? (
          <div className="text-slate-400 dark:text-slate-500">
            Loading...
          </div>
      ) : error ? (
          <div className="card text-center py-12 text-red-500">
            {error}
          </div>
      ) : quizzes.length === 0 ? (
        <div className="card text-center py-12 text-slate-400 dark:text-slate-500">No quizzes yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{q.title}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{q.category?.name || '—'}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{q.duration} min</td>
                  <td className="py-3">
                    <span className={`badge ${statusColors[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="py-3 text-right space-x-3">
                    <Link to={`/admin/quizzes/${q.id}/questions`} className="text-brand-600 hover:underline">Questions</Link>
                    <Link to={`/admin/quizzes/${q.id}/edit`} className="text-brand-600 hover:underline">Edit</Link>
                    <button onClick={() => handlePublishToggle(q)} className="text-amber-600 dark:text-amber-400 hover:underline">
                      {q.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
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

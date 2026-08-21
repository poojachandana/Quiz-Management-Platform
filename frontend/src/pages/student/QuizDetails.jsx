import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as quizzesApi from '../../api/quizzes'
import * as attemptsApi from '../../api/attempts'

export default function QuizDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [myAttempts, setMyAttempts] = useState([])
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    quizzesApi.getQuiz(id).then((res) => setQuiz(res.data))
    attemptsApi.getMyAttempts().then((res) =>
      setMyAttempts(res.data.filter((a) => a.quiz.id === Number(id)))
    )
  }, [id])

  const handleStart = async () => {
    setError('')
    setStarting(true)
    try {
      const res = await attemptsApi.startAttempt(id)
      navigate(`/student/attempt/${res.data.attempt.id}`, { state: { data: res.data } })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start quiz')
      setStarting(false)
    }
  }

  if (!quiz) return <Layout><div className="text-slate-400 dark:text-slate-500">Loading...</div></Layout>

  const attemptsUsed = myAttempts.filter((a) => a.status !== 'IN_PROGRESS').length
  const isUnlimited = quiz.maxAttempts === 0
  const attemptsLeft = quiz.maxAttempts - attemptsUsed
  const canAttempt = attemptsLeft > 0

  return (
    <Layout>
      <Link to="/student/quizzes" className="text-sm text-brand-600 hover:underline mb-4 inline-block">
        ← Back to quizzes
      </Link>
      <div className="card max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{quiz.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{quiz.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-slate-400 dark:text-slate-500">Category:</span> {quiz.category?.name || '—'}</div>
          <div><span className="text-slate-400 dark:text-slate-500">Difficulty:</span> {quiz.difficulty || '—'}</div>
          <div><span className="text-slate-400 dark:text-slate-500">Duration:</span> {quiz.duration} minutes</div>
          <div><span className="text-slate-400 dark:text-slate-500">Passing Score:</span> {quiz.passingScore}%</div>
          <div><span className="text-slate-400">Max Attempts:</span> {isUnlimited ? 'Unlimited' : quiz.maxAttempts}</div>
          <div><span className="text-slate-400">Attempts Used:</span> {attemptsUsed}{isUnlimited ? '' : ` / ${quiz.maxAttempts}`}</div>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <button
          onClick={handleStart}
          disabled={!canAttempt || starting}
          className="btn-primary"
        >
          {starting ? 'Starting...' : canAttempt ? 'Start Quiz' : 'No Attempts Remaining'}
        </button>

        {myAttempts.filter((a) => a.status !== 'IN_PROGRESS').length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Your Previous Attempts</h3>
            <div className="space-y-2">
              {myAttempts.filter((a) => a.status !== 'IN_PROGRESS').map((a) => (
                <Link
                  key={a.id}
                  to={`/student/result/${a.id}`}
                  className="flex justify-between text-sm py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span>{new Date(a.completedAt).toLocaleString()}</span>
                  <span className="font-medium">{a.percentage}% · {a.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

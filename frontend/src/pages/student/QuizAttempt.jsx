import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import * as attemptsApi from '../../api/attempts'

export default function QuizAttempt() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [attempt, setAttempt] = useState(location.state?.data?.attempt || null)
  const [questions, setQuestions] = useState(location.state?.data?.questions || [])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!location.state?.data)
  const [error, setError] = useState('')
  const hasAutoSubmitted = useRef(false)

  useEffect(() => {
    if (attempt && questions.length > 0) return
    attemptsApi.resumeAttempt(attemptId)
      .then((res) => {
        setAttempt(res.data.attempt)
        setQuestions(res.data.questions)
      })
      .catch(() => setError('Could not resume this attempt. It may have already been submitted.'))
      .finally(() => setLoading(false))
  }, [attemptId])

  useEffect(() => {
    if (!attempt) return
    const tick = () => {
      const expires = new Date(attempt.expiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0 && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true
        handleSubmit(true)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        answers: questions.map((q) => ({
          questionId: q.id,
          selectedOptionId: answers[q.id] || null,
        })),
      }
      const res = await attemptsApi.submitAttempt(attempt.quiz.id, attempt.id, payload)
      navigate(`/student/result/${res.data.id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }, [answers, questions, attempt, navigate, submitting])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 dark:text-slate-500">Loading quiz...</div>
  if (error && !attempt) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/student/quizzes')} className="btn-primary">Back to Quizzes</button>
      </div>
    </div>
  )
  if (!attempt || questions.length === 0) return null

  const question = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const minutes = Math.floor((timeLeft || 0) / 60)
  const seconds = (timeLeft || 0) % 60
  const isLowTime = timeLeft !== null && timeLeft < 60

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-slate-800 dark:text-slate-100">{attempt.quiz.title}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className={`text-lg font-mono font-bold px-4 py-1.5 rounded-lg ${
            isLowTime ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
          }`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Questions</h3>
            <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium flex items-center justify-center ${
                    i === currentIndex
                      ? 'bg-brand-600 text-white'
                      : answers[q.id]
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-3">{answeredCount} of {questions.length} answered</div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="btn-primary w-full mt-4"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>

        <div className="md:col-span-3 order-1 md:order-2">
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <div className="card">
            <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-6">{question.questionText}</p>
            <div className="space-y-3">
              {question.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                    answers[question.id] === opt.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={answers[question.id] === opt.id}
                    onChange={() => handleSelect(question.id, opt.id)}
                    className="accent-brand-600"
                  />
                  <span className="text-slate-700 dark:text-slate-200">{opt.optionText}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex === questions.length - 1}
                className="btn-primary"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

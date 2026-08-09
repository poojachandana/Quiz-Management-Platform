import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as attemptsApi from '../../api/attempts'

export default function Result() {
  const { attemptId } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    attemptsApi.getAttempt(attemptId).then((res) => setData(res.data))
  }, [attemptId])

  if (!data) return <Layout><div className="text-slate-400 dark:text-slate-500">Loading...</div></Layout>

  const { attempt, answers } = data
  const passed = attempt.status === 'PASSED'

  return (
    <Layout>
      <Link to="/student/history" className="text-sm text-brand-600 hover:underline mb-4 inline-block">
        ← Back to history
      </Link>

      <div className="card max-w-2xl mb-6 text-center">
        <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {attempt.percentage}%
        </div>
        <div className={`badge text-sm mb-4 ${passed ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
          {attempt.status}
        </div>
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">{attempt.quiz.title}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{attempt.correctAnswers}</div>
            <div className="text-slate-400 dark:text-slate-500">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{attempt.incorrectAnswers}</div>
            <div className="text-slate-400 dark:text-slate-500">Incorrect</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-500 dark:text-slate-400">{attempt.unanswered}</div>
            <div className="text-slate-400 dark:text-slate-500">Unanswered</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          Time taken: {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
        </div>
      </div>

      <div className="max-w-2xl">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Review Answers</h3>
        <div className="space-y-4">
          {answers.map((a, i) => {
            return (
              <div key={a.id} className="card">
                <p className="font-medium text-slate-800 dark:text-slate-100 mb-3">
                  {i + 1}. {a.question.questionText}
                </p>
                <div className="space-y-2 mb-3">
                  {a.question.options.map((opt) => {
                    const isSelected = a.selectedOption?.id === opt.id
                    const isCorrectOpt = opt.isCorrect
                    let style = 'border-slate-200 dark:border-slate-700'
                    if (isCorrectOpt) style = 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    else if (isSelected && !isCorrectOpt) style = 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    return (
                      <div key={opt.id} className={`p-2.5 rounded-lg border text-sm flex justify-between ${style}`}>
                        <span>{opt.optionText}</span>
                        {isSelected && <span className="text-xs font-medium">Your answer</span>}
                      </div>
                    )
                  })}
                </div>
                {a.question.explanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <span className="font-medium">Explanation:</span> {a.question.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

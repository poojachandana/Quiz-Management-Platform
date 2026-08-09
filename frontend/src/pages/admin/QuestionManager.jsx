import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as questionsApi from '../../api/questions'
import * as quizzesApi from '../../api/quizzes'

const emptyOption = () => ({ optionText: '', isCorrect: false })
const emptyForm = () => ({
  questionText: '',
  marks: 1,
  explanation: '',
  difficulty: 'INTERMEDIATE',
  options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
})

export default function QuestionManager() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([
      quizzesApi.getQuiz(quizId),
      questionsApi.getQuestions(quizId),
    ]).then(([quizRes, questionsRes]) => {
      setQuiz(quizRes.data)
      setQuestions(questionsRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [quizId])

  const handleOptionChange = (index, field, value) => {
    const options = [...form.options]
    if (field === 'isCorrect') {
      options.forEach((o, i) => { o.isCorrect = i === index })
    } else {
      options[index] = { ...options[index], [field]: value }
    }
    setForm({ ...form, options })
  }

  const addOption = () => setForm({ ...form, options: [...form.options, emptyOption()] })
  const removeOption = (index) => {
    if (form.options.length <= 2) return
    setForm({ ...form, options: form.options.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      marks: Number(form.marks),
      options: form.options.filter((o) => o.optionText.trim() !== ''),
    }
    try {
      if (editingId) {
        await questionsApi.updateQuestion(editingId, payload)
      } else {
        await questionsApi.createQuestion(quizId, payload)
      }
      setForm(emptyForm())
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleEdit = (q) => {
    setEditingId(q.id)
    setForm({
      questionText: q.questionText,
      marks: q.marks,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'INTERMEDIATE',
      options: q.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    await questionsApi.deleteQuestion(id)
    load()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  if (loading) return <Layout><div className="text-slate-400 dark:text-slate-500">Loading...</div></Layout>

  return (
    <Layout>
      <Link to="/admin/quizzes" className="text-sm text-brand-600 hover:underline mb-4 inline-block">
        ← Back to quizzes
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{quiz?.title}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{questions.length} question(s) · Status: {quiz?.status}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="card space-y-4 h-fit">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">{editingId ? 'Edit Question' : 'Add Question'}</h2>
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="label">Question Text</label>
            <textarea required className="input" rows={2} value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Marks</label>
              <input type="number" min={0.5} step={0.5} required className="input" value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="EASY">Easy</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Options (select the correct one)</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={opt.isCorrect}
                    onChange={() => handleOptionChange(i, 'isCorrect', true)}
                    className="accent-brand-600 shrink-0"
                  />
                  <input
                    className="input flex-1"
                    placeholder={`Option ${i + 1}`}
                    value={opt.optionText}
                    onChange={(e) => handleOptionChange(i, 'optionText', e.target.value)}
                  />
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-red-500 dark:text-red-400 text-sm px-1">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addOption} className="text-sm text-brand-600 hover:underline mt-2">
              + Add option
            </button>
          </div>

          <div>
            <label className="label">Explanation (optional)</label>
            <textarea className="input" rows={2} value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">{editingId ? 'Update Question' : 'Add Question'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancel</button>}
          </div>
        </form>

        <div className="space-y-3">
          {questions.length === 0 && (
            <div className="card text-center py-8 text-slate-400 dark:text-slate-500">No questions yet. Add one to get started.</div>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-slate-800 dark:text-slate-100">{i + 1}. {q.questionText}</p>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-2">{q.marks} mark(s)</span>
              </div>
              <div className="space-y-1 mb-3">
                {q.options.map((opt) => (
                  <div key={opt.id} className={`text-sm px-2 py-1 rounded ${opt.isCorrect ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                    {opt.isCorrect ? '✓ ' : '· '}{opt.optionText}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => handleEdit(q)} className="text-brand-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(q.id)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

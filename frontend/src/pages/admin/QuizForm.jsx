import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as quizzesApi from '../../api/quizzes'
import * as categoriesApi from '../../api/categories'

const emptyForm = {
  title: '',
  description: '',
  categoryId: '',
  difficulty: 'INTERMEDIATE',
  duration: 20,
  passingScore: 60,
  maxAttempts: 1,
  status: 'DRAFT',
  thumbnail: '',
}

export default function QuizForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    quizzesApi.getQuiz(id).then((res) => {
      const q = res.data
      setForm({
        title: q.title,
        description: q.description || '',
        categoryId: q.category?.id || '',
        difficulty: q.difficulty || 'INTERMEDIATE',
        duration: q.duration,
        passingScore: q.passingScore,
        maxAttempts: q.maxAttempts,
        status: q.status,
        thumbnail: q.thumbnail || '',
      })
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      categoryId: form.categoryId || null,
      duration: Number(form.duration),
      passingScore: Number(form.passingScore),
      maxAttempts: Number(form.maxAttempts),
    }
    try {
      if (isEdit) {
        await quizzesApi.updateQuiz(id, payload)
        navigate('/admin/quizzes')
      } else {
        const res = await quizzesApi.createQuiz(payload)
        navigate(`/admin/quizzes/${res.data.id}/questions`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  if (loading) return <Layout><div className="text-slate-400 dark:text-slate-500">Loading...</div></Layout>

  return (
    <Layout>
      <Link to="/admin/quizzes" className="text-sm text-brand-600 hover:underline mb-4 inline-block">
        ← Back to quizzes
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{isEdit ? 'Edit Quiz' : 'Create Quiz'}</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="label">Title</label>
          <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Duration (min)</label>
            <input type="number" min={1} required className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <div>
            <label className="label">Passing Score (%)</label>
            <input type="number" min={0} max={100} required className="input" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} />
          </div>
          <div>
            <label className="label">Max Attempts</label>
            <input type="number" min={1} required className="input" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Thumbnail URL (optional)</label>
          <input className="input" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." />
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
          </select>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">A quiz can only be published once it has at least one question.</p>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary">{isEdit ? 'Save Changes' : 'Create & Add Questions'}</button>
          <Link to="/admin/quizzes" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </Layout>
  )
}

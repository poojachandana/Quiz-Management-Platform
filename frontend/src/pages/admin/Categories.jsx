import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as categoriesApi from '../../api/categories'

const statusColors = {
  PUBLISHED: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  DRAFT: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  UNPUBLISHED: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const [viewingCategory, setViewingCategory] = useState(null)
  const [categoryQuizzes, setCategoryQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(false)

  const load = () => categoriesApi.getCategories().then((res) => setCategories(res.data))

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await categoriesApi.updateCategory(editingId, form)
      } else {
        await categoriesApi.createCategory(form)
      }
      setForm({ name: '', description: '' })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleEdit = (cat) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, description: cat.description || '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    await categoriesApi.deleteCategory(id)
    if (viewingCategory?.id === id) setViewingCategory(null)
    load()
  }

  const handleViewQuizzes = async (category) => {
    setViewingCategory(category)
    setQuizzesLoading(true)
    try {
      const res = await categoriesApi.getQuizzesInCategory(category.id)
      setCategoryQuizzes(res.data)
    } finally {
      setQuizzesLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Manage Categories</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="card space-y-4 md:col-span-1 h-fit">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">{editingId ? 'Edit Category' : 'New Category'}</h2>
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm({ name: '', description: '' }) }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="md:col-span-2 space-y-6">
          <div className="card divide-y divide-slate-100 dark:divide-slate-700">
            {categories.length === 0 && <div className="text-slate-400 dark:text-slate-500 text-center py-8">No categories yet.</div>}
            {categories.map((c) => (
              <div key={c.id} className="flex justify-between items-center py-3">
                <button onClick={() => handleViewQuizzes(c)} className="text-left hover:opacity-80">
                  <div className={`font-medium ${viewingCategory?.id === c.id ? 'text-brand-600' : 'text-slate-800 dark:text-slate-100'}`}>{c.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{c.description}</div>
                </button>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button onClick={() => handleViewQuizzes(c)} className="text-sm text-brand-600 hover:underline">View Quizzes</button>
                  <button onClick={() => handleEdit(c)} className="text-sm text-brand-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {viewingCategory && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Quizzes in "{viewingCategory.name}"</h3>
              {quizzesLoading ? (
                <div className="text-slate-400 dark:text-slate-500 text-sm py-4">Loading...</div>
              ) : categoryQuizzes.length === 0 ? (
                <div className="text-slate-400 dark:text-slate-500 text-sm py-4 text-center">No quizzes in this category yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {categoryQuizzes.map((q) => (
                    <div key={q.id} className="flex justify-between items-center py-2.5 text-sm">
                      <Link to={`/admin/quizzes/${q.id}/edit`} className="font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400">
                        {q.title}
                      </Link>
                      <span className={`badge ${statusColors[q.status]}`}>{q.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

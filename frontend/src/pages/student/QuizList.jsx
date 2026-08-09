import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import * as quizzesApi from '../../api/quizzes'
import * as categoriesApi from '../../api/categories'

const difficultyColors = {
  EASY: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  HARD: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [maxDuration, setMaxDuration] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (categoryId) params.categoryId = categoryId
    if (difficulty) params.difficulty = difficulty
    if (maxDuration) params.maxDuration = maxDuration
    if (sortBy) params.sortBy = sortBy

    const timeout = setTimeout(() => {
      quizzesApi.getQuizzes(params)
        .then((res) => setQuizzes(res.data))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, categoryId, difficulty, maxDuration, sortBy])

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Available Quizzes</h1>

      <div className="card mb-6 space-y-3">
        <input
          className="input"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="input sm:flex-1" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="input sm:flex-1" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="HARD">Hard</option>
          </select>
          <select className="input sm:flex-1" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)}>
            <option value="">Any Duration</option>
            <option value="10">Up to 10 min</option>
            <option value="20">Up to 20 min</option>
            <option value="30">Up to 30 min</option>
            <option value="60">Up to 60 min</option>
          </select>
          <select className="input sm:flex-1" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Default order</option>
            <option value="recent">Recently added</option>
            <option value="popularity">Most popular</option>
            <option value="duration">Shortest first</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 dark:text-slate-500">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="card text-center py-12 text-slate-400 dark:text-slate-500">No quizzes found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Link key={quiz.id} to={`/student/quizzes/${quiz.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{quiz.title}</h3>
                {quiz.difficulty && (
                  <span className={`badge ${difficultyColors[quiz.difficulty]}`}>{quiz.difficulty}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{quiz.description}</p>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>{quiz.category?.name || 'Uncategorized'}</span>
                <span>{quiz.duration} min</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}

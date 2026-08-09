import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import * as usersApi from '../../api/users'

export default function Students() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => usersApi.getStudents(search).then((res) => setStudents(res.data)).finally(() => setLoading(false))

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search])

  const openProfile = async (id) => {
    setSelected(id)
    const res = await usersApi.getStudentProfile(id)
    setProfile(res.data)
  }

  const toggleStatus = async (student) => {
    const next = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await usersApi.setStudentStatus(student.id, next)
    load()
    if (selected === student.id) openProfile(student.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this student account? This cannot be undone.')) return
    await usersApi.deleteStudent(id)
    setSelected(null)
    setProfile(null)
    load()
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Manage Students</h1>

      <input
        className="input max-w-md mb-6"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-slate-400 dark:text-slate-500">Loading...</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map((s) => (
                    <tr key={s.id} className={selected === s.id ? 'bg-brand-50 dark:bg-brand-900/30' : ''}>
                      <td className="py-3">
                        <button onClick={() => openProfile(s.id)} className="font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400">
                          {s.name}
                        </button>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{s.email}</td>
                      <td className="py-3">
                        <span className={`badge ${s.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-3">
                        <button onClick={() => toggleStatus(s)} className="text-amber-600 dark:text-amber-400 hover:underline">
                          {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          {profile ? (
            <div className="card">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{profile.user.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{profile.user.email}</p>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <div className="text-lg font-bold text-brand-600">{profile.quizzesAttempted}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Attempted</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{profile.averageScore}%</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Average</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{profile.highestScore}%</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Highest</div>
                </div>
              </div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Quiz History</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {profile.attempts.filter(a => a.status !== 'IN_PROGRESS').map((a) => (
                  <div key={a.id} className="flex justify-between text-sm py-1.5 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300 truncate mr-2">{a.quiz.title}</span>
                    <span className="font-medium shrink-0">{a.percentage}%</span>
                  </div>
                ))}
                {profile.attempts.length === 0 && (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No attempts yet</div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              Select a student to view their profile
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

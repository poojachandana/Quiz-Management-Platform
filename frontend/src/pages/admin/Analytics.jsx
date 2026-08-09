import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import Layout from '../../components/Layout'
import * as adminApi from '../../api/admin'

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7']

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    adminApi.getAnalytics().then((res) => setData(res.data))
  }, [])

  if (!data) return <Layout><div className="text-slate-400 dark:text-slate-500">Loading...</div></Layout>

  const attemptsOverTime = Object.entries(data.attemptsOverTime || {}).map(([date, count]) => ({
    date: date.slice(5), count,
  }))
  const averageScoreOverTime = Object.entries(data.averageScoreOverTime || {}).map(([date, avg]) => ({
    date: date.slice(5), avg,
  }))
  const registrations = Object.entries(data.studentRegistrations || {}).map(([date, count]) => ({
    date: date.slice(5), count,
  }))
  const passFail = [
    { name: 'Passed', value: data.passFailRatio?.passed || 0 },
    { name: 'Failed', value: data.passFailRatio?.failed || 0 },
  ]
  const popularQuizzes = data.mostPopularQuizzes || []
  const popularCategories = data.mostPopularCategories || []

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Quiz Attempts Over Time (14 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attemptsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Student Registrations (14 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={registrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Average Quiz Score Over Time (14 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={averageScoreOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line type="monotone" dataKey="avg" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Pass / Fail Ratio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={passFail} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {passFail.map((entry, i) => (
                  <Cell key={entry.name} fill={i === 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Most Popular Categories</h3>
          {popularCategories.length === 0 ? (
            <div className="text-slate-400 dark:text-slate-500 text-sm py-12 text-center">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={popularCategories} dataKey="attempts" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {popularCategories.map((entry, i) => (
                    <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Most Popular Quizzes</h3>
        {popularQuizzes.length === 0 ? (
          <div className="text-slate-400 dark:text-slate-500 text-sm py-8 text-center">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, popularQuizzes.length * 50)}>
            <BarChart data={popularQuizzes} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="quizTitle" fontSize={12} width={160} />
              <Tooltip />
              <Bar dataKey="attempts" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Layout>
  )
}

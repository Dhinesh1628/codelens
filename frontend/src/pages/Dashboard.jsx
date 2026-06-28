import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import './Dashboard.css'

const API = 'http://localhost:5000'

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')

  useEffect(() => {
    fetch(`${API}/api/review/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.reviews) })
      .finally(() => setLoading(false))
  }, [token])

  const handleReview = () => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
    if (!match) { alert('Paste a valid GitHub PR URL'); return }
    navigate(`/review/${match[1]}/${match[2]}/${match[3]}`)
  }

  const avgScore = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + (r.score || 0), 0) / reviews.length)
    : 0

  const chartData = [...reviews].reverse().slice(-10).map((r, i) => ({
    name: `#${r.pr || i + 1}`, score: r.score || 0,
  }))

  const scoreClass = s => s >= 8 ? 'good' : s >= 5 ? 'avg' : s > 0 ? 'bad' : 'none'
  const recIcon = r => ({ APPROVE: '✅', REQUEST_CHANGES: '❌', NEEDS_DISCUSSION: '💬' }[r] || '📋')

  return (
    <div className="dash-page">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🔍</div>
          <span className="sidebar-logo-name">CodeLens</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-item active">📊 Dashboard</div>
          <div className="sidebar-nav-item" onClick={() => navigate('/')}>🏠 New Review</div>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/') }} title="Sign out">↩</button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          </div>
        </div>

        {/* Quick review input */}
        <div className="dash-review-bar">
          <div className="dash-review-input-wrap">
            <span className="dash-prompt">$</span>
            <input
              type="text"
              placeholder="https://github.com/owner/repo/pull/42"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReview()}
            />
          </div>
          <button className="dash-review-btn" onClick={handleReview}>Analyze PR →</button>
        </div>

        {/* Stats row */}
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-card">
            <div className={`stat-value score-${scoreClass(avgScore)}`}>{avgScore > 0 ? `${avgScore}/10` : '—'}</div>
            <div className="stat-label">Avg Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value success">
              {reviews.filter(r => r.recommendation === 'APPROVE').length}
            </div>
            <div className="stat-label">Approved PRs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value danger">
              {reviews.filter(r => r.recommendation === 'REQUEST_CHANGES').length}
            </div>
            <div className="stat-label">Needs Changes</div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="dash-chart-card">
            <div className="dash-section-title">Score Trend</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--violet)" strokeWidth={2} dot={{ fill: 'var(--violet)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Review history */}
        <div className="dash-section-title" style={{ marginTop: 28 }}>
          Review History
          <span className="dash-count">{reviews.length}</span>
        </div>

        {loading && <div className="dash-empty">Loading history...</div>}

        {!loading && reviews.length === 0 && (
          <div className="dash-empty">
            <div className="dash-empty-icon">📭</div>
            <div>No reviews yet. Analyze your first PR above!</div>
          </div>
        )}

        <div className="dash-history-list">
          {reviews.map((r, i) => {
            const match = r.url?.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
            const owner = match?.[1], repo = match?.[2], pr = match?.[3]
            return (
              <div key={i} className="dash-history-item"
                onClick={() => owner && navigate(`/review/${owner}/${repo}/${pr}`)}>
                <div className="dhi-left">
                  <span className="dhi-icon">{recIcon(r.recommendation)}</span>
                  <div className="dhi-info">
                    <div className="dhi-repo">{r.repo} <span className="dhi-pr">#{r.pr}</span></div>
                    <div className="dhi-title">{r.title || 'Pull Request'}</div>
                    <div className="dhi-meta">
                      {r.filesChanged} files · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="dhi-right">
                  {r.score > 0 && (
                    <span className={`dhi-score ${scoreClass(r.score)}`}>{r.score}/10</span>
                  )}
                  <span className="dhi-arrow">→</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

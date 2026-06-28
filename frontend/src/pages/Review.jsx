import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FileDiff from '../components/FileDiff.jsx'
import Loader from '../components/Loader.jsx'
import './Review.css'

function ScoreRing({ avg }) {
  const r = 42, circ = 2 * Math.PI * r
  const cls = avg >= 8 ? 'ring-green' : avg >= 5 ? 'ring-yellow' : 'ring-red'
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (avg / 10) * circ), 50)
    return () => clearTimeout(t)
  }, [avg, circ])

  return (
    <div className="score-ring">
      <svg viewBox="0 0 96 96" width="96" height="96">
        <circle className="score-ring-track" cx="48" cy="48" r={r} />
        <circle
          className={`score-ring-fill ${cls}`}
          cx="48" cy="48" r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-label">
        <span className="ring-number">{avg}</span>
        <span className="ring-denom">/10</span>
      </div>
    </div>
  )
}

function MetricBar({ label, value }) {
  const cls = value >= 8 ? 'bar-green' : value >= 5 ? 'bar-yellow' : 'bar-red'
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(value * 10), 80); return () => clearTimeout(t) }, [value])

  return (
    <div className="metric-row">
      <div className="metric-label-row">
        <span className="metric-name">{label}</span>
        <span className="metric-val">{value}/10</span>
      </div>
      <div className="metric-bar-bg">
        <div className={`metric-bar-fill ${cls}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export default function Review() {
  const { owner, repo, pr } = useParams()
  const navigate = useNavigate()
  const url = `https://github.com/${owner}/${repo}/pull/${pr}`

  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    setLoading(true); setError(''); setData(null)
    fetch(`http://localhost:5000/api/review?url=${encodeURIComponent(url)}`)
      .then(async r => {
        const json = await r.json()
        if (!r.ok) throw new Error(json.error || json.message || 'Failed to fetch review.')
        return json
      })
      .then(json => {
        setData(json)
        const overall = json.overall || json.summary || {}
        const score = overall.overallScore || json.overallScore || {}
        const avg = score ? Math.round(((score.quality||0)+(score.security||0)+(score.performance||0)+(score.readability||0))/4) : 0
        const history = JSON.parse(localStorage.getItem('cl_history') || '[]')
        const entry = { url, repo: `${owner}/${repo}`, title: json.pr?.title || '', score: avg }
        const updated = [entry, ...history.filter(h => h.url !== url)].slice(0, 10)
        localStorage.setItem('cl_history', JSON.stringify(updated))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [url])

  if (loading) return <Loader url={url} />

  if (error) return (
    <div className="review-error-page">
      <div className="error-card">
        <div className="error-icon">⚠️</div>
        <h2>Could not review this PR</h2>
        <p>{error}</p>
        <button className="btn-back" onClick={() => navigate('/')}>← Try another PR</button>
      </div>
    </div>
  )

  if (!data) return null

  const prData       = data.pr || {}
  const files        = data.files || []
  const overall      = data.overall || data.summary || {}
  const overallScore = overall.overallScore || data.overallScore || {}

  const avg = overallScore
    ? Math.round(((overallScore.quality||0)+(overallScore.security||0)+(overallScore.performance||0)+(overallScore.readability||0))/4)
    : 0

  const recMap = {
    APPROVE:           { cls: 'rec-green',  icon: '✅', label: 'Approve' },
    REQUEST_CHANGES:   { cls: 'rec-red',    icon: '❌', label: 'Request Changes' },
    NEEDS_DISCUSSION:  { cls: 'rec-yellow', icon: '💬', label: 'Needs Discussion' },
  }
  const rec = recMap[overall.recommendation] || { cls: 'rec-yellow', icon: '💬', label: overall.recommendation?.replace(/_/g,' ') || '—' }

  const stateClass = prData.state === 'open' ? 'open' : prData.state === 'merged' ? 'merged' : 'closed'

  return (
    <div className="review-page">
      {/* Nav */}
      <nav className="review-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">🔍</div>
          CodeLens
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-back-nav" onClick={() => navigate('/')}>← Home</button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="pr-link">
            View on GitHub ↗
          </a>
        </div>
      </nav>

      {/* PR Header */}
      <div className="pr-header-card">
        <div className="pr-meta-row">
          <span className="pr-repo-badge">{owner}/{repo}</span>
          <span className="pr-num-badge">#{pr}</span>
          {prData.state && <span className={`pr-state-badge ${stateClass}`}>{prData.state}</span>}
        </div>
        <h1 className="pr-title-main">{prData.title || 'Pull Request Review'}</h1>
        <div className="pr-stats-row">
          {prData.author && <span className="pr-stat">👤 {prData.author}</span>}
          <span className="pr-stat">📁 {prData.filesChanged || files.length} files</span>
          {prData.additions !== undefined && <span className="pr-stat stat-add">+{prData.additions}</span>}
          {prData.deletions !== undefined && <span className="pr-stat stat-del">−{prData.deletions}</span>}
        </div>
        {prData.description && prData.description !== 'No description provided.' && (
          <div className="pr-desc-box">{prData.description}</div>
        )}
      </div>

      {/* Score Band */}
      <div className="score-band">
        <div className="score-ring-wrap">
          <ScoreRing avg={avg} />
          <span className="score-ring-sub">Overall Score</span>
        </div>

        <div className="metric-bars">
          <MetricBar label="Quality"     value={overallScore.quality     || 0} />
          <MetricBar label="Security"    value={overallScore.security    || 0} />
          <MetricBar label="Performance" value={overallScore.performance || 0} />
          <MetricBar label="Readability" value={overallScore.readability || 0} />
        </div>

        {overall.recommendation && (
          <div className={`rec-pill ${rec.cls}`}>
            <span className="rec-icon">{rec.icon}</span>
            <span className="rec-label">Recommendation</span>
            <span className="rec-value">{rec.label}</span>
            {overall.recommendationReason && (
              <span className="rec-reason">{overall.recommendationReason}</span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {overall.overallSummary && (
        <div className="summary-card">
          <div className="summary-card-title">📋 PR Summary</div>
          <p className="summary-text">{overall.overallSummary}</p>
          {overall.mainConcerns?.length > 0 && (
            <div className="concerns-block">
              <div className="concerns-title">Main Concerns</div>
              <ul>
                {overall.mainConcerns.map((c, i) => (
                  <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* File Reviews */}
      <div className="files-section-header">
        <span className="files-section-title">File-by-File Review</span>
        <span className="file-count-pill">{files.length} files</span>
      </div>
      {files.map((f, i) => <FileDiff key={i} file={f} index={i} />)}
    </div>
  )
}

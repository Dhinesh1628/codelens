import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScoreCard from '../components/ScoreCard.jsx'
import FileDiff from '../components/FileDiff.jsx'
import Loader from '../components/Loader.jsx'
import './Review.css'

export default function Review() {
  const { owner, repo, pr } = useParams()
  const navigate = useNavigate()
  const url = `https://github.com/${owner}/${repo}/pull/${pr}`

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

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
        const avg = score ? Math.round(((score.quality||0) + (score.security||0) + (score.performance||0) + (score.readability||0)) / 4) : 0
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
    ? Math.round(((overallScore.quality||0) + (overallScore.security||0) + (overallScore.performance||0) + (overallScore.readability||0)) / 4)
    : 0

  const recColor = {
    APPROVE: 'rec-green',
    REQUEST_CHANGES: 'rec-red',
    NEEDS_DISCUSSION: 'rec-yellow',
  }[overall.recommendation] || 'rec-yellow'

  return (
    <div className="review-page">
      <nav className="review-nav">
        <button className="btn-back-nav" onClick={() => navigate('/')}>← CodeLens</button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="pr-link">
          View on GitHub ↗
        </a>
      </nav>

      <div className="review-content">
        {/* PR Header */}
        <div className="pr-header">
          <div className="pr-meta">
            <span className="pr-repo">{owner}/{repo}</span>
            <span className="pr-num">#{pr}</span>
            {prData.state && <span className={`pr-state ${prData.state}`}>{prData.state}</span>}
          </div>
          <h1 className="pr-title">{prData.title || 'Pull Request Review'}</h1>
          <div className="pr-stats">
            {prData.author && <span>👤 {prData.author}</span>}
            <span>📁 {prData.filesChanged || files.length} files changed</span>
            {prData.additions !== undefined && <span className="adds">+{prData.additions}</span>}
            {prData.deletions !== undefined && <span className="dels">-{prData.deletions}</span>}
          </div>
          {prData.description && prData.description !== 'No description provided.' && (
            <div className="pr-desc">{prData.description}</div>
          )}
        </div>

        {/* Overall Score */}
        <div className="overall-section">
          <div className="overall-left">
            <div className="big-score">
              <div className={`score-circle ${avg >= 8 ? 'green' : avg >= 5 ? 'yellow' : 'red'}`}>
                {avg}<span>/10</span>
              </div>
              <div className="score-label">Overall Score</div>
            </div>
            {overall.recommendation && (
              <div className={`recommendation ${recColor}`}>
                <span className="rec-label">Recommendation</span>
                <span className="rec-value">{overall.recommendation?.replace(/_/g, ' ')}</span>
                <span className="rec-reason">{overall.recommendationReason || ''}</span>
              </div>
            )}
          </div>
          <div className="overall-right">
            <ScoreCard scores={overallScore} />
          </div>
        </div>

        {/* Overall Summary */}
        {overall.overallSummary && (
          <div className="summary-card">
            <h3>📋 PR Summary</h3>
            <p>{overall.overallSummary}</p>
            {overall.mainConcerns?.length > 0 && (
              <div className="concerns">
                <div className="concerns-title">Main Concerns</div>
                <ul>{overall.mainConcerns.map((c, i) => (
                  <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                ))}</ul>
              </div>
            )}
          </div>
        )}

        {/* File Reviews */}
        <div className="files-section">
          <h2>File-by-File Review <span className="file-count">({files.length} files)</span></h2>
          {files.map((f, i) => <FileDiff key={i} file={f} index={i} />)}
        </div>
      </div>
    </div>
  )
}

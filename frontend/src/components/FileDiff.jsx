import { useState, useEffect } from 'react'
import './FileDiff.css'

function SidebarMetric({ label, value }) {
  const cls = value >= 8 ? 'bar-green' : value >= 5 ? 'bar-yellow' : 'bar-red'
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(value * 10), 100); return () => clearTimeout(t) }, [value])
  return (
    <div className="sidebar-metric">
      <div className="sidebar-metric-row">
        <span className="sidebar-metric-name">{label}</span>
        <span className="sidebar-metric-val">{value}/10</span>
      </div>
      <div className="sidebar-bar-bg">
        <div className={`sidebar-bar-fill ${cls}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}

export default function FileDiff({ file, index }) {
  const [open, setOpen] = useState(index === 0)
  const [tab, setTab] = useState('diff')

  const r = file.aiReview || file.review || {}
  const filename = file.name || file.filename || 'Unknown file'
  const score = r.score || {}
  const avg = score ? Math.round(((score.quality||0)+(score.security||0)+(score.performance||0)+(score.readability||0))/4) : 0

  const statusMap = { added: 'badge-added', modified: 'badge-modified', removed: 'badge-removed', renamed: 'badge-renamed' }
  const diff = file.diff || file.patch || ''

  const renderDiff = (patch) => {
    if (!patch) return <div className="diff-empty">No diff available for this file.</div>
    let lineNum = 0
    return patch.split('\n').map((line, i) => {
      let cls = 'diff-line'
      if (line.startsWith('@@')) { cls += ' diff-hunk'; lineNum = 0 }
      else if (line.startsWith('+') && !line.startsWith('+++')) { cls += ' diff-add'; lineNum++ }
      else if (line.startsWith('-') && !line.startsWith('---')) { cls += ' diff-del' }
      else if (!line.startsWith('\\')) lineNum++
      return (
        <div key={i} className={cls}>
          <span className="diff-ln">{lineNum > 0 ? lineNum : ''}</span>
          <span className="diff-text">{line}</span>
        </div>
      )
    })
  }

  const scoreClass = avg >= 8 ? 'fscore-green' : avg >= 5 ? 'fscore-yellow' : 'fscore-red'
  const hasReview = r.summary || r.bugs?.length || r.security?.length || r.suggestions?.length || r.positives?.length

  return (
    <div className="file-card">
      <div className="file-header" onClick={() => setOpen(!open)}>
        <div className="file-left">
          <span className={`file-toggle ${open ? 'open' : ''}`}>{open ? '▼' : '▶'}</span>
          <span className={`file-status-badge ${statusMap[file.status] || 'badge-modified'}`}>
            {file.status || 'modified'}
          </span>
          <span className="file-name">{filename}</span>
          <div className="file-changes">
            {(file.additions || 0) > 0 && <span className="file-add">+{file.additions}</span>}
            {(file.deletions || 0) > 0 && <span className="file-del">−{file.deletions}</span>}
          </div>
        </div>
        <div className="file-right">
          {avg > 0 && <span className={`file-score-badge ${scoreClass}`}>{avg}/10</span>}
        </div>
      </div>

      {open && (
        <div className="file-body">
          <div className="file-tabs">
            <button className={`file-tab ${tab === 'diff' ? 'active' : ''}`} onClick={() => setTab('diff')}>
              Diff
            </button>
            {hasReview && (
              <button className={`file-tab ${tab === 'review' ? 'active' : ''}`} onClick={() => setTab('review')}>
                🤖 AI Review
              </button>
            )}
          </div>

          {tab === 'diff' && (
            <div className="diff-code">{renderDiff(diff)}</div>
          )}

          {tab === 'review' && hasReview && (
            <div className="ai-review-body">
              {r.summary && <p className="ai-summary-text">{r.summary}</p>}
              <div className="review-grid">
                <div className="review-panels">
                  {r.bugs?.length > 0 && (
                    <div className="review-panel panel-danger">
                      <div className="panel-title">🐛 Bugs Found</div>
                      <ul className="panel-list">
                        {r.bugs.map((b, i) => <li key={i}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.security?.length > 0 && (
                    <div className="review-panel panel-warning">
                      <div className="panel-title">🔒 Security</div>
                      <ul className="panel-list">
                        {r.security.map((s, i) => <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.suggestions?.length > 0 && (
                    <div className="review-panel panel-accent">
                      <div className="panel-title">💡 Suggestions</div>
                      <ul className="panel-list">
                        {r.suggestions.map((s, i) => <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.positives?.length > 0 && (
                    <div className="review-panel panel-success">
                      <div className="panel-title">✅ Positives</div>
                      <ul className="panel-list">
                        {r.positives.map((p, i) => <li key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="file-score-sidebar">
                  <div className="sidebar-score-title">File Score</div>
                  {['quality','security','performance','readability'].map(k => (
                    score[k] !== undefined && <SidebarMetric key={k} label={k} value={score[k]} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

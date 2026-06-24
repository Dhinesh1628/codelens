import { useState } from 'react'
import ScoreCard from './ScoreCard.jsx'
import './FileDiff.css'

export default function FileDiff({ file, index }) {
  const [open, setOpen] = useState(index === 0)

  // handle both field name formats
  const r = file.aiReview || file.review || {}
  const filename = file.name || file.filename || 'Unknown file'
  const score = r.score || {}
  const avg = score ? Math.round(((score.quality||0) + (score.security||0) + (score.performance||0) + (score.readability||0)) / 4) : 0

  const statusColor = { added: 'green', modified: 'yellow', removed: 'red', renamed: 'yellow' }
  const diff = file.diff || file.patch || ''

  const renderDiff = (patch) => {
    if (!patch) return <div className="diff-line" style={{color:'var(--muted)'}}>No diff available</div>
    return patch.split('\n').map((line, i) => {
      let cls = 'diff-line'
      if (line.startsWith('+') && !line.startsWith('+++')) cls += ' diff-add'
      else if (line.startsWith('-') && !line.startsWith('---')) cls += ' diff-del'
      else if (line.startsWith('@@')) cls += ' diff-hunk'
      return <div key={i} className={cls}><span className="diff-text">{line}</span></div>
    })
  }

  return (
    <div className="file-card">
      <div className="file-header" onClick={() => setOpen(!open)}>
        <div className="file-left">
          <span className="file-toggle">{open ? '▼' : '▶'}</span>
          <span className={`file-status ${statusColor[file.status] || 'yellow'}`}>{file.status || 'modified'}</span>
          <span className="file-name">{filename}</span>
          <span className="file-adds">+{file.additions || 0}</span>
          <span className="file-dels">-{file.deletions || 0}</span>
        </div>
        <div className="file-right">
          <span className={`file-score ${avg >= 8 ? 'green' : avg >= 5 ? 'yellow' : 'red'}`}>{avg}/10</span>
        </div>
      </div>

      {open && (
        <div className="file-body">
          <div className="diff-block">
            <div className="diff-label">Diff</div>
            <div className="diff-code">{renderDiff(diff)}</div>
          </div>

          <div className="ai-review">
            <div className="ai-label">🤖 AI Review</div>
            {r.summary && <p className="ai-summary">{r.summary}</p>}

            <div className="review-grid">
              <div className="review-cols">
                {r.bugs?.length > 0 && (
                  <div className="review-group">
                    <div className="rg-title danger">🐛 Bugs Found</div>
                    <ul>{r.bugs.map((b, i) => <li key={i}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>)}</ul>
                  </div>
                )}
                {r.security?.length > 0 && (
                  <div className="review-group">
                    <div className="rg-title warning">🔒 Security</div>
                    <ul>{r.security.map((s, i) => <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>)}</ul>
                  </div>
                )}
                {r.suggestions?.length > 0 && (
                  <div className="review-group">
                    <div className="rg-title accent">💡 Suggestions</div>
                    <ul>{r.suggestions.map((s, i) => <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>)}</ul>
                  </div>
                )}
                {r.positives?.length > 0 && (
                  <div className="review-group">
                    <div className="rg-title success">✅ Positives</div>
                    <ul>{r.positives.map((p, i) => <li key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>)}</ul>
                  </div>
                )}
              </div>
              <div className="review-score">
                <div className="score-title">File Score</div>
                <ScoreCard scores={score} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import CodeCanvas from '../components/CodeCanvas.jsx'
import './Home.css'

export default function Home() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const handleReview = () => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
    if (!match) {
      alert('Paste a valid GitHub PR URL')
      return
    }
    navigate(`/review/${match[1]}/${match[2]}/${match[3]}`)
  }

  return (
    <div className="home-wrap">
      <CodeCanvas />

      <div className="home-inner">
        <div className="home-topbar">
          <div className="logo-row">
            <div className="logo-icon">🔍</div>
            <div>
              <div className="logo-name">CodeLens</div>
              <div className="logo-badge">AI PR review</div>
            </div>
          </div>

          <div className="home-auth-btns">
            {isLoggedIn ? (
              <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>Dashboard</button>
            ) : (
              <>
                <Link className="btn-login" to="/login">Log in</Link>
                <Link className="btn-signup" to="/register">Sign up</Link>
              </>
            )}
          </div>
        </div>

        <div className="home-hero">
          <div className="home-eyebrow">⚡ Instant code review insights</div>
          <h1 className="home-h1">
            Review pull requests in a <span>single command</span>
          </h1>
          <p className="home-tagline">
            Drop in a GitHub PR URL and get a fast, structured AI review with quality, security, and readability signals.
          </p>
        </div>

        <div className="terminal-box">
          <div className="terminal-top">
            <span className="term-dot r" />
            <span className="term-dot y" />
            <span className="term-dot g" />
            <span className="term-label">codelens review</span>
          </div>
          <div className="terminal-input-row">
            <span className="term-prompt">$</span>
            <input
              type="text"
              placeholder="https://github.com/owner/repo/pull/42"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReview()}
            />
          </div>
        </div>

        <button className="btn-review" onClick={handleReview}>
          <span>Analyze PR</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>

        <div className="home-stats">
          <div className="home-stat">
            <div className="home-stat-val">4D</div>
            <div className="home-stat-label">Faster review loops</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-val">10/10</div>
            <div className="home-stat-label">Signal quality</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-val">100%</div>
            <div className="home-stat-label">Actionable insights</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import './Loader.css'

const STEPS = [
  { icon: '🔗', text: 'Fetching PR metadata from GitHub...' },
  { icon: '📁', text: 'Loading file diffs...' },
  { icon: '🤖', text: 'Analyzing code with LLaMA AI...' },
  { icon: '📊', text: 'Calculating quality scores...' },
  { icon: '✅', text: 'Finalizing review...' },
]

export default function Loader({ url }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 2800)
    return () => clearInterval(iv)
  }, [])

  const repoMatch = url?.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/)
  const repoLabel = repoMatch ? `${repoMatch[1]}#${repoMatch[2]}` : url

  return (
    <div className="loader-page">
      <div className="loader-card">
        <div className="loader-logo">
          <div className="loader-logo-icon">🔍</div>
          <span className="loader-logo-name">CodeLens</span>
        </div>

        <div className="loader-pr">{repoLabel}</div>

        <div className="loader-spinner">
          <svg viewBox="0 0 48 48" width="52" height="52">
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4"/>
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke="var(--violet)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="30 96"
              className="spin-circle"
            />
          </svg>
        </div>

        <div className="loader-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`loader-step ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
              <span className="step-icon">
                {i < step ? '✓' : s.icon}
              </span>
              <span className="step-text">{s.text}</span>
            </div>
          ))}
        </div>

        <div className="loader-bar-wrap">
          <div className="loader-bar-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

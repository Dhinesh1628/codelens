import { useEffect, useRef } from 'react'

const CODE_SNIPPETS = [
  'const auth = jwt.verify(token)',
  'if (err) throw new Error()',
  'SELECT * FROM users WHERE',
  'npm run build --prod',
  'git diff HEAD~1',
  'async function fetchPR()',
  'res.status(401).json()',
  'export default function()',
  '.filter(f => f.status)',
  'await Promise.all(files)',
  'const score = avg / 10',
  'import { useState }',
  'try { } catch (err) { }',
  'return res.json({ ok })',
  '@deprecated // remove',
  'TODO: fix race condition',
  'SECURITY: SQL injection',
  'type Score = number',
]

export default function CodeCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
      speed: 0.12 + Math.random() * 0.18,
      opacity: 0.04 + Math.random() * 0.08,
    }))

    let scanY = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Grid dots
      ctx.fillStyle = 'rgba(59,130,246,0.05)'
      const gap = 40
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          ctx.beginPath()
          ctx.arc(x, y, 0.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Floating code lines
      ctx.font = '12px "JetBrains Mono", monospace'
      particles.forEach(p => {
        const dist = Math.abs(p.y - scanY)
        const boost = dist < 80 ? (1 - dist / 80) * 0.3 : 0
        ctx.fillStyle = `rgba(99,179,237,${p.opacity + boost})`
        ctx.fillText(p.text, p.x, p.y)
        p.y -= p.speed
        if (p.y < -20) {
          p.y = canvas.height + 20
          p.x = Math.random() * canvas.width
          p.text = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]
        }
      })

      // Scan beam gradient
      const beamH = 120
      const grad = ctx.createLinearGradient(0, scanY - beamH, 0, scanY + beamH)
      grad.addColorStop(0,   'rgba(59,130,246,0)')
      grad.addColorStop(0.45,'rgba(59,130,246,0.04)')
      grad.addColorStop(0.5, 'rgba(99,179,237,0.09)')
      grad.addColorStop(0.55,'rgba(59,130,246,0.04)')
      grad.addColorStop(1,   'rgba(59,130,246,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - beamH, canvas.width, beamH * 2)

      // Scan line
      ctx.strokeStyle = 'rgba(99,179,237,0.22)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(canvas.width, scanY)
      ctx.stroke()

      scanY += 0.7
      if (scanY > canvas.height + beamH) scanY = -beamH

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

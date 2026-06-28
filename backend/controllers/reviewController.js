import { fetchPullRequestData } from '../services/githubService.js'
import { reviewFileDiff, reviewOverall } from '../services/claudeService.js'
import { saveReview, getUserReviews } from '../models/userStore.js'
import { authenticate } from '../middleware/auth.js'

export const reviewPullRequest = async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ success: false, message: 'GitHub PR URL is required' })

    const prData = await fetchPullRequestData(url)
    const reviewedFiles = []
    let totalQuality = 0, totalSecurity = 0, totalPerformance = 0, totalReadability = 0

    for (const file of prData.files.slice(0, 2)) {
      const aiReview = await reviewFileDiff(file.filename, file.patch || 'No diff available')
      totalQuality     += aiReview.score?.quality     || 0
      totalSecurity    += aiReview.score?.security    || 0
      totalPerformance += aiReview.score?.performance || 0
      totalReadability += aiReview.score?.readability || 0
      reviewedFiles.push({
        name: file.filename, status: file.status,
        additions: file.additions, deletions: file.deletions,
        diff: file.patch || '', aiReview,
      })
    }

    const count = reviewedFiles.length || 1
    const overallScore = {
      quality:     +(totalQuality     / count).toFixed(1),
      security:    +(totalSecurity    / count).toFixed(1),
      performance: +(totalPerformance / count).toFixed(1),
      readability: +(totalReadability / count).toFixed(1),
    }

    const summary = await reviewOverall(prData.title, prData.description || '', reviewedFiles)
    const avg = Math.round((overallScore.quality + overallScore.security + overallScore.performance + overallScore.readability) / 4)

    // Save review to user history if authenticated
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken')
        const secret = process.env.JWT_SECRET || 'codelens_secret_key_2024'
        const decoded = jwt.default.verify(authHeader.split(' ')[1], secret)
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
        saveReview(decoded.id, {
          url, repo: match ? `${match[1]}/${match[2]}` : '',
          pr: match?.[3], title: prData.title,
          score: avg, overallScore,
          recommendation: summary?.recommendation || '',
          filesChanged: reviewedFiles.length,
        })
      } catch {}
    }

    return res.json({
      success: true,
      pr: { title: prData.title, description: prData.description, author: prData.author, filesChanged: reviewedFiles.length, state: prData.state, additions: prData.additions, deletions: prData.deletions },
      files: reviewedFiles,
      overallScore,
      summary,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getHistory = [authenticate, (req, res) => {
  const reviews = getUserReviews(req.user.id)
  return res.json({ success: true, reviews })
}]

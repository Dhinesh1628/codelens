import { fetchPullRequestData } from "../services/githubService.js";
import { reviewFileDiff, reviewOverall } from "../services/claudeService.js";

export const reviewPullRequest = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, message: "GitHub PR URL is required" });
    }

    const prData = await fetchPullRequestData(url);
    const reviewedFiles = [];
    let totalQuality = 0, totalSecurity = 0, totalPerformance = 0, totalReadability = 0;

    for (const file of prData.files.slice(0, 2)) {
      const aiReview = await reviewFileDiff(file.filename, file.patch || "No diff available");
      totalQuality += aiReview.score.quality;
      totalSecurity += aiReview.score.security;
      totalPerformance += aiReview.score.performance;
      totalReadability += aiReview.score.readability;
      reviewedFiles.push({
        name: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        diff: file.patch || "",
        aiReview,
      });
    }

    const count = reviewedFiles.length || 1;
    const overallScore = {
      quality: +(totalQuality / count).toFixed(1),
      security: +(totalSecurity / count).toFixed(1),
      performance: +(totalPerformance / count).toFixed(1),
      readability: +(totalReadability / count).toFixed(1),
    };

    const summary = await reviewOverall(prData.title, prData.description || "", reviewedFiles);

    return res.json({
      success: true,
      pr: { title: prData.title, description: prData.description, author: prData.author, filesChanged: reviewedFiles.length },
      files: reviewedFiles,
      overallScore,
      summary,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

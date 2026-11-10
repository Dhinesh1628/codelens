export const parsePRUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('PR URL must be a non-empty string');
  }

  const regex = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123');
  }

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3],
  };
};

export const fetchPullRequestData = async (url) => {
  const { owner, repo, pullNumber } = parsePRUrl(url);

  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CodeLens-App/1.0',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  };

  const prApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
  const prResponse = await fetch(prApiUrl, { headers: githubHeaders });

  if (!prResponse.ok) {
    if (prResponse.status === 404) {
      throw new Error(`GitHub PR not found (HTTP 404). Ensure repository "${owner}/${repo}" is public or GITHUB_TOKEN has access.`);
    }
    if (prResponse.status === 403 || prResponse.status === 429) {
      throw new Error(`GitHub API rate limit reached or access forbidden (HTTP ${prResponse.status}). Configure a personal GITHUB_TOKEN in backend/.env.`);
    }
    const errorData = await prResponse.text();
    throw new Error(`GitHub PR API Error (${prResponse.status}): ${errorData}`);
  }

  const pr = await prResponse.json();

  const filesApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=30`;
  const filesResponse = await fetch(filesApiUrl, { headers: githubHeaders });

  if (!filesResponse.ok) {
    if (filesResponse.status === 403 || filesResponse.status === 429) {
      throw new Error(`GitHub API rate limit reached while retrieving PR files (HTTP ${filesResponse.status}).`);
    }
    const errorData = await filesResponse.text();
    throw new Error(`GitHub Files API Error (${filesResponse.status}): ${errorData}`);
  }

  const files = await filesResponse.json();

  return {
    owner,
    repo,
    pullNumber,
    title: pr.title || 'Untitled Pull Request',
    description: pr.body || '',
    author: pr.user?.login || 'Unknown',
    state: pr.state || 'open',
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
    filesChanged: files.length,
    files,
  };
};

const parsePRUrl = (url) => {
  const regex =
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

  const match = url.match(regex);

  if (!match) {
    throw new Error("Invalid GitHub PR URL");
  }

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3],
  };
};

export const fetchPullRequestData = async (url) => {
  const { owner, repo, pullNumber } = parsePRUrl(url);

  console.log("Parsed PR URL:", {
    owner,
    repo,
    pullNumber,
  });

  const prApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;

  console.log("PR API URL:", prApiUrl);

  const prResponse = await fetch(prApiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeLens",
    },
  });

  if (!prResponse.ok) {
    const errorData = await prResponse.text();

    throw new Error(
      `GitHub PR API Error (${prResponse.status}): ${errorData}`
    );
  }

  const pr = await prResponse.json();

  const filesApiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;

  const filesResponse = await fetch(filesApiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeLens",
    },
  });

  if (!filesResponse.ok) {
    const errorData = await filesResponse.text();

    throw new Error(
      `GitHub Files API Error (${filesResponse.status}): ${errorData}`
    );
  }

  const files = await filesResponse.json();

  return {
    title: pr.title,
    description: pr.body || "",
    author: pr.user?.login || "Unknown",
    files,
  };
};
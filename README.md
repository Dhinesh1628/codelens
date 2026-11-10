# CodeLens — AI Pull Request Reviewer & Automated Code Inspector

**CodeLens** is an automated code review engine designed to streamline GitHub pull request evaluations. It connects to the GitHub REST API, extracts pull request metadata and file diff patches, streams them to Anthropic Claude (or Groq Llama 3) for deep static analysis, generates structured category scorecards (Quality, Security, Performance, Readability), and provides actionable review recommendations (`APPROVE`, `REQUEST_CHANGES`, `NEEDS_DISCUSSION`).

---

## 1. Problem Statement

Modern software teams face recurring friction in their pull request review cycles:
1. **Reviewer Fatigue & Bottlenecks**: Senior engineers spend excessive time scanning repetitive boilerplate, formatting flaws, and trivial syntax issues instead of focusing on high-level architecture.
2. **Overlooked Security & Edge-Case Bugs**: Subtleties such as unhandled nulls, memory leaks, and missing input bounds frequently slip through manual reviews.
3. **Inconsistent Review Standards**: Pull requests reviewed by different team members receive widely varying levels of scrutiny.

CodeLens addresses these challenges by automating the initial pass of every pull request, calculating category-by-category code health metrics, pinpointing potential security risks, and tracking pull request review history over time.

---

## 2. Key Features

- **GitHub PR URL Ingestion**: Simply paste any public GitHub pull request link to parse owner, repository, and pull number.
- **Real-Time Diff Analysis**: Fetches file patches directly from GitHub's REST API and analyzes additions, deletions, and changed lines without fabrication.
- **Multi-Model AI Review Engine**:
  - **Anthropic Claude 3.5 Sonnet**: Comprehensive semantic reasoning and bug detection via `@anthropic-ai/sdk`.
  - **Groq Llama 3.1 8B**: Sub-second high-throughput fallback for instant review responses.
- **Categorized Multi-Metric Scorecard**:
  - **Quality** (1–10)
  - **Security** (1–10)
  - **Performance** (1–10)
  - **Readability** (1–10)
- **Actionable PR Recommendations**: Emits clear verdicts (`APPROVE`, `REQUEST_CHANGES`, `NEEDS_DISCUSSION`) backed by explicit rationales.
- **Review History & Trends Dashboard**: Authenticated users can view their past reviews, track score trends across revisions, and jump directly back to previous analyses.
- **Dynamic File Diff Inspector**: Side-by-side patch visualizer with bug callouts and positive pattern highlights.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite 8, React Router v6, Recharts (score trend visualizations), CSS Custom Properties.
- **Backend**: Node.js (ESM), Express 4, `@anthropic-ai/sdk`, `axios`, `jsonwebtoken`, `bcryptjs`, `cors`.
- **APIs**: GitHub REST API v3, Anthropic Messages API, Groq OpenAI-compatible Chat API.
- **Verification**: Node.js assert-based unit and integration test runner.

---

## 4. Architecture Overview

```
 +------------------------+              +--------------------------+
 |  React 18 + Vite SPA   |  HTTP / REST |  Express API Server      |
 |  (Dashboard / Review)  | -----------> |  (Node.js ESM / 5000)    |
 +------------------------+              +--------------------------+
      |               ^                              |
      | URL / Bearer  | JSON Scorecard               |
      v               |                              v
 +------------------------+              +--------------------------+
 | Review Views:          |              | External Integrations:   |
 | - Score Rings & Metrics|              | 1. GitHub REST API       |
 | - File Diff Cards      |              |    (/pulls/:id/files)    |
 | - Recharts Trend Graph |              | 2. Anthropic Claude SDK  |
 | - Review History List  |              | 3. Groq Fast Fallback    |
 +------------------------+              +--------------------------+
```

---

## 5. Project Folder Structure

```
codelens/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and auth token issuance
│   │   └── reviewController.js   # PR analysis orchestrator and history endpoints
│   ├── middleware/
│   │   └── auth.js               # JWT verification & token signing
│   ├── models/
│   │   └── userStore.js          # In-memory user store and review history manager
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   └── reviewRoutes.js       # /api/review endpoints
│   ├── services/
│   │   ├── claudeService.js      # Anthropic Claude & Groq dual-provider AI review engine
│   │   └── githubService.js      # GitHub REST API PR and file patch retrieval
│   ├── tests/
│   │   └── run-tests.js          # Automated verification test suite
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies & npm scripts
│   └── server.js                 # Express server root
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeCanvas.jsx    # Animated canvas particle background
│   │   │   ├── FileDiff.jsx      # File diff syntax card with AI suggestions
│   │   │   └── Loader.jsx        # Terminal-style analysis progress indicator
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & token persistence
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Public landing & PR input terminal
│   │   │   ├── Review.jsx        # Full review results, scores & file diffs
│   │   │   ├── Dashboard.jsx     # Review history & score trend charts
│   │   │   ├── Login.jsx         # Sign-in form
│   │   │   └── Register.jsx      # Account creation form
│   │   ├── api.js                # Centralized backend URL configuration
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx              # DOM root entry
│   ├── index.html                # HTML entry
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build configuration
├── vercel.json                   # Vercel SPA build & routing configuration
├── .env.example                  # Root environment template
├── .gitignore                    # Git ignore rules
└── README.md                     # Engineering documentation
```

---

## 6. Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/Dhinesh1628/codelens.git
cd codelens

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

---

## 7. Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
# AI Provider: Anthropic Claude (Primary)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Alternative AI Provider: Groq (Fast Fallback)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# GitHub API Integration (increases rate limit from 60 to 5000 req/hr)
GITHUB_TOKEN=your_github_personal_access_token_here

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 8. Database Setup

CodeLens uses an in-memory session and review store (`backend/models/userStore.js`):
- No external database installation (PostgreSQL/MongoDB) is required for development or standard review workflows.
- For production persistence across container restarts, reviews can optionally be serialized to SQLite or MongoDB using the review store interface.

---

## 9. API Endpoint Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create account | No |
| `POST` | `/api/auth/login` | Authenticate & receive token | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes (Bearer) |

### Code Review (`/api/review`)
| Method | Endpoint | Description | Query / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/review` | Fetch GitHub PR, analyze diffs, & return scorecard | `?url=https://github.com/owner/repo/pull/123` |
| `GET` | `/api/review/history` | Retrieve user's historical PR analyses | None (Bearer) |

---

## 10. Testing Instructions

### Backend Automated Test Suite
Run the verification suite:
```bash
cd backend
npm test
```

Test validations performed:
1. **GitHub PR URL Parsing**: Validates standard, deep-linked, and malformed URL handling.
2. **AI Response Normalization**: Verifies stripping of markdown code fences (````json ... ````) and JSON structure compliance.
3. **Scorecard Aggregation**: Verifies multi-file score calculations across quality, security, performance, and readability.
4. **Auth & History Isolation**: Verifies JWT issuance and per-user review history separation.
5. **Live GitHub PR Integration**: Verifies live connection to GitHub's public API without data fabrication.

### Frontend Build Check
```bash
cd frontend
npm run build
```

---

## 11. Deployment Instructions

### Backend (Render / Railway)
1. Create a Web Service connected to your repository.
2. Set Root Directory to `backend`.
3. Set Build Command: `npm install` and Start Command: `npm start`.
4. Configure Environment Variables: `ANTHROPIC_API_KEY` (or `GROQ_API_KEY`), `GITHUB_TOKEN`, `JWT_SECRET`, `PORT`.

### Frontend (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Root `vercel.json` automatically triggers `cd frontend && npm install && npm run build`.
3. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
4. Deploy!

---

## 12. Known Limitations

- **Large PR Diff Truncation**: Diffs are sliced to the first 3000 characters per file (up to 5 files) to stay within LLM context window quotas.
- **Private Repositories**: Analyzing private repositories requires configuring a GitHub personal access token with `repo` scope in `GITHUB_TOKEN`.
- **In-Memory Store**: Review history and user accounts reset on backend restart in the default memory store adapter.

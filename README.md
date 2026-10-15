# RepoRadar — Daily GitHub Viral Repo Check

> **"Find tomorrow's favorite GitHub project today."**

RepoRadar is a responsive developer discovery dashboard designed to track trending GitHub repositories, monitor breakout viral momentum, and accurately calculate genuine growth velocity without fabricating repository metrics.

Inspired by the polished design standards of **Linear**, **Vercel**, **Raycast**, and **GitHub**.

---

## 🌟 Core Value & Highlights

- **Zero Fabricated Metrics**: Unlike generic tools that label lifetime stars as "stars gained today", RepoRadar uses a rigorous, empirical snapshot engine that measures delta only between verified observation timestamps.
- **Viral Watch Radar**: Calculates a multi-signal momentum score taking into account snapshot velocity, creation freshness (stars/day since repository creation), and developer engagement (fork-to-star branching ratio).
- **Real GitHub REST API v3**: Live search queries with qualifiers, language filters, topic tags, markdown README previews, and clone URL copy.
- **Transparent Growth Engine**: When a repo is first discovered, it is honestly labeled as *"Baseline established — tracking started"* rather than inventing fake daily charts.
- **Power User Mode**: Toggle between responsive modern card grids and high-density tabular power-user lists.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant fuzzy search across repositories, fast tab jumps, theme switching, and JSON bookmark export.
- **Local Bookmarks Collection**: Persisted locally in `localStorage`, with real-time filtering, single-click removal, JSON export, and JSON backup restoration.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Strict Mode)
- **Bundler & Tooling**: Vite 6, Vitest
- **Styling**: Tailwind CSS v4 with custom design tokens (Linear-inspired layered graphite panels, electric violet/indigo `#6366F1` accents, GitHub-inspired green `#10B981` indicators)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (rendered only when authentic historical delta snapshots exist)
- **Markdown Parser**: React-Markdown + Remark-GFM for rich GitHub README previews
- **Typography**: Inter (UI) & JetBrains Mono (metrics, commands, code)

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
- **Node.js**: v20.18+ or v22+
- **npm**: v10+

### 2. Installation
```bash
git clone <repository-url>
cd "Github repo listing"
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Environment Variables & GitHub API Quotas

RepoRadar runs out-of-the-box without requiring an API key using GitHub's public REST endpoints.

| Configuration | Location | Rate Limit | Purpose |
| :--- | :--- | :--- | :--- |
| **Unauthenticated (Default)** | Client IP | 60 req/hr (10 search/min) | Instant zero-config evaluation |
| **Personal Access Token (PAT)** | `Settings` tab or `.env` (`VITE_GITHUB_TOKEN`) | 5,000 req/hr (30 search/min) | Production usage and extensive research |

### Configuring a Personal Access Token (PAT)
1. Open RepoRadar and click **Settings** in the sidebar.
2. Generate a free **Fine-grained Personal Access Token** on [github.com/settings/tokens](https://github.com/settings/tokens) with `Public Repositories (read-only)` scope.
3. Paste the token in Settings and click **Save & Validate**.
4. The token is stored **exclusively in your browser's `localStorage`** and is only transmitted over HTTPS directly to `api.github.com`.

---

## 📈 Growth Measurement Methodology

GitHub's public API does not provide a historical time-series endpoint for daily stars without polling or webhooks. RepoRadar implements a defensible observation framework:

1. **Snapshot Recording**: Whenever repositories are queried, RepoRadar captures `{ repoId, fullName, stars, forks, timestamp }` into local storage.
2. **Observation Windows**:
   - If **1 snapshot exists**: Displays `"Not measured yet"` with a tooltip explaining that an initial baseline was recorded.
   - If **2+ snapshots exist**: Computes:
     $$\Delta\text{stars} = \text{stars}_{\text{latest}} - \text{stars}_{\text{baseline}}$$
     $$\text{velocity} = \frac{\Delta\text{stars}}{\text{hours elapsed}}$$
3. **Viral Score Composite**:
   - **Velocity (40%)**: Verified stars gained per hour.
   - **Growth Rate (25%)**: Relative percentage gain compared to baseline.
   - **Engagement (15%)**: Fork-to-star ratio reflecting active code forks.
   - **Freshness & Push Recency (20%)**: Recent commit pushes within 24 hours and repository age.
4. **Simulator Mode**: In the **Settings** view, users can click **"Simulate 24h Baseline (Demo / Test)"** to simulate an earlier snapshot baseline and test delta calculations immediately.

---

## 📱 Navigation & Views

1. **Discover**: Overview discovery summary with 4 calculated metrics, quick language chips, filter drawer, and dual grid/list view.
2. **Trending Today**: Focused view on repositories pushed or created in the last 24–48 hours.
3. **Viral Watch**: Real-time breakout radar ranking repositories with multi-signal momentum scores and interactive scoring explanations.
4. **Explore Languages**: Visual breakdown of top languages (TypeScript, Python, Rust, Go, Swift, Dart, Kotlin, C++, etc.) with calculated repository counts.
5. **Bookmarks**: Saved repository library with text search, language filter, JSON export, and JSON import.
6. **Settings**: Token authentication, live rate limit countdown monitor, search cache clearing, and snapshot controls.

---

## 🔒 Security & Privacy

- **No Data Telemetry**: No third-party analytics or tracker scripts.
- **Client-Side Isolation**: All bookmarks, preferences, and snapshots remain strictly in the user's browser.
- **Safe External Navigation**: All external links to GitHub maintain `rel="noopener noreferrer"` attributes.

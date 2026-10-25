import { useEffect, useState } from 'react'
import '../App.css'

const API_URL = 'http://127.0.0.1:8000'

function AnalyticsPage() {
  const [stats, setStats] = useState({
    total_reports: 0,
    pending_reports: 0,
    resolved_reports: 0,
  })

  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        setError('')

        const [statsResponse, issuesResponse] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`),
          fetch(`${API_URL}/api/analytics/issues`),
        ])

        if (!statsResponse.ok || !issuesResponse.ok) {
          throw new Error('Could not load analytics data.')
        }

        const statsData = await statsResponse.json()
        const issuesData = await issuesResponse.json()

        // Backend ke statistics fields ko frontend fields se match karo.
        const result = statsData.stats || statsData

        setStats({
          total_reports: Number(
            result.total ?? result.total_reports ?? 0
          ),
          pending_reports: Number(
            result.pending ?? result.pending_reports ?? 0
          ),
          resolved_reports: Number(
            result.resolved ?? result.resolved_reports ?? 0
          ),
        })

        // Backend direct array ya nested issues array return kar sakta hai.
        const issueList = Array.isArray(issuesData)
          ? issuesData
          : issuesData.issues || []

        setIssues(issueList)
      } catch (err) {
        setError(
          err.message ||
            'Unable to load analytics. Please check that the backend is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  // Backend count field use karta hai.
  const maxIssueCount = Math.max(
    1,
    ...issues.map((issue) => Number(issue.count ?? issue.total) || 0)
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">Hydroniq</h2>
        <p className="sidebar-label">WORKSPACE</p>

        <nav>
          <a className="nav-link" href="/">
            Dashboard
          </a>

          <a className="nav-link" href="/reports">
            Water Reports
          </a>

          <a className="nav-link active" href="/analytics">
            Impact Analytics
          </a>
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot"></span>
          Local AI active
          <p>Powered by open-source AI</p>
        </div>
      </aside>

      <main className="main-content">
        <a href="/" className="back-link">
          ← Back to dashboard
        </a>

        <header className="topbar report-header">
          <div>
            <p className="eyebrow">COMMUNITY INSIGHTS</p>
            <h1>Impact Analytics</h1>
            <p className="subtitle">
              Understand reported water problems in your community.
            </p>
          </div>
        </header>

        {loading && (
          <p role="status">Loading analytics from MySQL...</p>
        )}

        {error && (
          <div className="reports-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="analytics-stats-grid">
              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">📋</span>
                <p>Total reports</p>
                <h2>{stats.total_reports}</h2>
                <span>All submitted complaints</span>
              </article>

              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">⏳</span>
                <p>Pending reports</p>
                <h2>{stats.pending_reports}</h2>
                <span>Awaiting action</span>
              </article>

              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">✅</span>
                <p>Resolved reports</p>
                <h2>{stats.resolved_reports}</h2>
                <span>Marked as resolved</span>
              </article>
            </section>

            <section className="analytics-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">ISSUE BREAKDOWN</p>
                  <h2>Reports by issue type</h2>
                </div>

                <span className="ai-badge">
                  {issues.length} issue types
                </span>
              </div>

              {issues.length === 0 ? (
                <p>No issue data is available yet.</p>
              ) : (
                <div className="analytics-chart">
                  {issues.map((issue) => {
                    const count =
                      Number(issue.count ?? issue.total) || 0

                    const width = (count / maxIssueCount) * 100

                    return (
                      <div
                        className="analytics-bar-row"
                        key={issue.issue_type}
                      >
                        <div className="analytics-bar-label">
                          <span>{issue.issue_type}</span>
                          <strong>{count}</strong>
                        </div>

                        <div
                          className="analytics-bar-track"
                          role="img"
                          aria-label={`${issue.issue_type}: ${count} reports`}
                        >
                          <div
                            className="analytics-bar-fill"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <p className="analytics-note">
              These figures represent submitted reports and their recorded
              statuses. They do not independently verify repairs or measure
              the amount of water saved.
            </p>
          </>
        )}

        <footer>Hydroniq · Every drop matters.</footer>
      </main>
    </div>
  )
}

export default AnalyticsPage

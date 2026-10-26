import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

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

        const result = statsData.stats || statsData

        setStats({
          total_reports: Number(result.total ?? result.total_reports ?? 0),
          pending_reports: Number(result.pending ?? result.pending_reports ?? 0),
          resolved_reports: Number(result.resolved ?? result.resolved_reports ?? 0),
        })

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

  const maxIssueCount = Math.max(
    1,
    ...issues.map((issue) => Number(issue.count ?? issue.total) || 0)
  )

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Link to="/" className="back-link">
          Back to dashboard
        </Link>

        <header className="topbar">
          <div>
            <p className="eyebrow">METRICS & ANALYTICS</p>
            <h1>Impact & Problem Analytics</h1>
            <p className="subtitle">
              Distribution and trends of reported water infrastructure problems.
            </p>
          </div>

          <Link to="/area-monitoring" className="btn-secondary">
            Area Breakdown
          </Link>
        </header>

        {loading && (
          <p role="status" style={{ padding: '20px 0', color: '#0d9488', fontWeight: 600 }}>
            Fetching analytics metrics from database...
          </p>
        )}

        {error && (
          <div className="alert-error" role="alert">
            <strong>Data Fetch Error</strong>
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
              style={{ marginTop: '12px' }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="analytics-stats-grid">
              <article className="analytics-stat-card">
                <p>Total Complaints</p>
                <h2>{stats.total_reports}</h2>
                <span>Lifetime submitted reports</span>
              </article>

              <article className="analytics-stat-card">
                <p>Pending Inquiries</p>
                <h2>{stats.pending_reports}</h2>
                <span>Awaiting municipal review</span>
              </article>

              <article className="analytics-stat-card">
                <p>Problems Solved</p>
                <h2>{stats.resolved_reports}</h2>
                <span>Marked as resolved</span>
              </article>
            </section>

            <section className="analytics-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">DISTRIBUTION</p>
                  <h2>Reports by Issue Classification</h2>
                </div>

                <span className="ai-badge">
                  {issues.length} {issues.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>

              {issues.length === 0 ? (
                <p className="section-description">No issue data is available yet.</p>
              ) : (
                <div className="analytics-chart">
                  {issues.map((issue) => {
                    const count = Number(issue.count ?? issue.total) || 0
                    const width = (count / maxIssueCount) * 100

                    return (
                      <div className="analytics-bar-row" key={issue.issue_type}>
                        <div className="analytics-bar-label">
                          <span>{issue.issue_type}</span>
                          <strong>{count} {count === 1 ? 'report' : 'reports'}</strong>
                        </div>

                        <div
                          className="analytics-bar-track"
                          role="img"
                          aria-label={`${issue.issue_type}: ${count} reports`}
                        >
                          <div
                            className="analytics-bar-fill"
                            style={{ width: `${Math.max(5, width)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <p className="analytics-note">
              These figures represent live records stored in your MySQL database. Status changes updated in the reports feed automatically recalculate in this dashboard.
            </p>
          </>
        )}

        <footer>Hydroniq · Open Infrastructure Platform</footer>
      </main>
    </div>
  )
}

export default AnalyticsPage

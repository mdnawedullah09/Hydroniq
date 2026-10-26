import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../App.css'

const API_URL = 'http://127.0.0.1:8000'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setStatsError('')

      const response = await fetch(`${API_URL}/api/dashboard/stats`)

      if (!response.ok) {
        throw new Error(`Could not load statistics (${response.status})`)
      }

      const data = await response.json()
      const result = data.stats || data

      setStats({
        total_reports: Number(result.total ?? result.total_reports ?? 0),
        pending_reports: Number(result.pending ?? result.pending_reports ?? 0),
        resolved_reports: Number(result.resolved ?? result.resolved_reports ?? 0),
      })
    } catch (err) {
      setStatsError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">ENVIRONMENTAL INTELLIGENCE</p>
            <h1>Water problems deserve faster solutions.</h1>
            <p className="subtitle">
              Report issues, track community complaints, and coordinate infrastructure repairs.
            </p>
          </div>

          <span className="ai-badge">Water Management System</span>
        </header>

        <section className="welcome-card">
          <div className="welcome-card-body">
            <p className="eyebrow light">CITIZEN REPORTING PLATFORM</p>
            <h2>Community-driven water conservation</h2>
            <p>
              Report leaking pipes, broken handpumps, and contamination issues.
              Each submission is tracked and categorized for municipal response.
            </p>
            <Link className="primary-button" to="/report">
              File a Water Problem Report
            </Link>
          </div>
        </section>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LIVE METRICS</p>
              <h2>Overview Statistics</h2>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={fetchStats}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh data'}
            </button>
          </div>

          {statsError && (
            <div className="alert-error" role="alert">
              <strong>Database Connection Error</strong>
              <p>{statsError}</p>
              <button
                type="button"
                className="primary-button"
                onClick={fetchStats}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                Retry
              </button>
            </div>
          )}

          <div className="stats-grid" id="analytics">
            <article className="stat-card">
              <p>Total Submissions</p>
              <h2>{loading && !stats ? '—' : stats?.total_reports ?? 0}</h2>
              <span className="stat-note">
                {loading && !stats
                  ? 'Loading records...'
                  : statsError
                  ? 'Could not refresh data'
                  : 'Recorded in database'}
              </span>
            </article>

            <article className="stat-card">
              <p>Pending Inquiries</p>
              <h2>{loading && !stats ? '—' : stats?.pending_reports ?? 0}</h2>
              <span className="stat-note">Awaiting administrative action</span>
            </article>

            <article className="stat-card">
              <p>Issues Resolved</p>
              <h2>{loading && !stats ? '—' : stats?.resolved_reports ?? 0}</h2>
              <span className="stat-note">Marked resolved</span>
            </article>
          </div>
        </section>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMMUNITY REPORTING</p>
              <h2>Submit an incident</h2>
            </div>
            <span className="ai-badge">Local Processing</span>
          </div>

          <p className="section-description">
            Submit water problems with precise locality and descriptions. The system
            structures the complaint, extracts relevant details, and readies it for review.
          </p>

          <Link className="primary-button" to="/report">
            Open Report Form
          </Link>
        </section>

        <footer>Hydroniq · Open Infrastructure Platform</footer>
      </main>
    </div>
  )
}

export default Dashboard
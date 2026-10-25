import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

      const response = await fetch(
        `${API_URL}/api/dashboard/stats`
      )

      if (!response.ok) {
        throw new Error(
          `Could not load statistics (${response.status})`
        )
      }

      const data = await response.json()
      const result = data.stats || data

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
    } catch (err) {
      setStatsError(
        err.message || 'Could not connect to the backend.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">Hydroniq</h2>

        {/* Sidebar heading */}
        <p className="sidebar-label">WORKSPACE</p>

        <nav>
          <Link className="nav-link active" to="/">
            Dashboard
          </Link>

          <Link className="nav-link" to="/reports">
            Water Reports
          </Link>

          <Link className="nav-link" to="/analytics">
            Impact Analytics
          </Link>

          <Link className="nav-link" to="/area-monitoring">
            Area Monitoring
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot"></span>
          Local AI active
          <p>Powered by open-source AI</p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              ENVIRONMENTAL INTELLIGENCE
            </p>

            <h1>Water problems deserve faster solutions.</h1>

            <p className="subtitle">
              Report issues, organize complaints, and help
              protect every drop.
            </p>
          </div>

          <span className="ai-badge">
            ✦ AI-assisted platform
          </span>
        </header>

        <section className="welcome-card">
          <div>
            <p className="eyebrow light">
              SMALL REPORTS. BIG IMPACT.
            </p>

            <h2>Every drop matters.</h2>

            <p>
              Help your community identify leaking taps,
              broken handpumps, and other water supply
              problems.
            </p>

            <Link className="primary-button" to="/report">
              + Report a water issue
            </Link>
          </div>

          <div className="water-art" aria-hidden="true">
            💧
          </div>
        </section>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LIVE OVERVIEW</p>
              <h2>Community water reports</h2>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={fetchStats}
              disabled={loading}
            >
              {loading ? 'Loading...' : '↻ Refresh stats'}
            </button>
          </div>

          {statsError && (
            <div className="reports-error" role="alert">
              <p>{statsError}</p>

              <button
                type="button"
                className="primary-button"
                onClick={fetchStats}
                disabled={loading}
              >
                Try again
              </button>
            </div>
          )}

          <div className="stats-grid" id="analytics">
            <article className="stat-card">
              <span className="stat-icon">📋</span>
              <p>Total reports</p>

              <h2>
                {loading && !stats
                  ? '—'
                  : stats?.total_reports ?? 0}
              </h2>

              <span className="stat-note">
                {loading && !stats
                  ? 'Loading statistics...'
                  : statsError
                    ? 'Could not refresh data'
                    : 'From MySQL database'}
              </span>
            </article>

            <article className="stat-card">
              <span className="stat-icon">⏳</span>
              <p>Pending reports</p>

              <h2>
                {loading && !stats
                  ? '—'
                  : stats?.pending_reports ?? 0}
              </h2>

              <span className="stat-note">
                Awaiting action
              </span>
            </article>

            <article className="stat-card">
              <span className="stat-icon">🔧</span>
              <p>Issues resolved</p>

              <h2>
                {loading && !stats
                  ? '—'
                  : stats?.resolved_reports ?? 0}
              </h2>

              <span className="stat-note">
                Marked Resolved in database
              </span>
            </article>
          </div>
        </section>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMMUNITY ACTION</p>
              <h2>Report a water problem</h2>
            </div>

            <span className="coming-soon">
              Live submission
            </span>
          </div>

          <p className="section-description">
            Submit water problems with their location and
            description. Local Gemma AI can suggest
            categories and missing details for human review.
          </p>

          <Link className="primary-button" to="/report">
            Open water report form
          </Link>
        </section>

        <footer>
          Hydroniq · Open-source AI for a healthier planet
        </footer>
      </main>
    </div>
  )
}

export default Dashboard
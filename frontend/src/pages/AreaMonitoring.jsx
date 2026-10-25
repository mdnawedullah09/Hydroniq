import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

const API_URL = 'http://127.0.0.1:8000'

function AreaMonitoring() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch(`${API_URL}/api/reports`)

        if (!response.ok) {
          throw new Error('Could not load water reports.')
        }

        const data = await response.json()
        const reportList = Array.isArray(data) ? data : data.reports

        if (!Array.isArray(reportList)) {
          throw new Error('Unexpected response from the reports API.')
        }

        setReports(reportList)
      } catch (err) {
        setError(err.message || 'Unable to connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const areas = Object.values(
    reports.reduce((groups, report) => {
      const state = report.state?.trim() || 'Unknown state'
      const district = report.district?.trim() || 'Unknown district'
      const key = `${state}|||${district}`

      if (!groups[key]) {
        groups[key] = {
          state,
          district,
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
        }
      }

      groups[key].total += 1

      const status = report.status?.toLowerCase()

      if (status === 'pending') {
        groups[key].pending += 1
      } else if (status === 'in progress') {
        groups[key].inProgress += 1
      } else if (status === 'resolved') {
        groups[key].resolved += 1
      }

      return groups
    }, {})
  ).sort((a, b) => b.total - a.total)

  const pendingCount = reports.filter(
    (report) => report.status?.toLowerCase() === 'pending'
  ).length

  const maxReports = Math.max(
    1,
    ...areas.map((area) => area.total)
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">Hydroniq</h2>
        <p className="sidebar-label">AREA MONITORING</p>

        <nav>
          <Link className="nav-link" to="/">
            Dashboard
          </Link>

          <Link className="nav-link" to="/reports">
            Water Reports
          </Link>

          <Link className="nav-link" to="/analytics">
            Impact Analytics
          </Link>

          <Link className="nav-link active" to="/area-monitoring">
            Area Monitoring
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot"></span>
          Local AI active
          <p>Powered by open-source AI</p>
        </div>
      </aside>

      <main className="main-content">
        <Link to="/" className="back-link">
          ← Back to dashboard
        </Link>

        <header className="topbar report-header">
          <div>
            <p className="eyebrow">LOCATION INTELLIGENCE</p>
            <h1>Area Monitoring</h1>
            <p className="subtitle">
              Monitor reported water problems across states and districts.
            </p>
          </div>
        </header>

        <section className="analytics-stats-grid">
          <article className="analytics-stat-card">
            <span className="analytics-stat-icon">📍</span>
            <p>Areas monitored</p>
            <h2>{loading ? '—' : areas.length}</h2>
            <span>State and district combinations</span>
          </article>

          <article className="analytics-stat-card">
            <span className="analytics-stat-icon">📋</span>
            <p>Total reports</p>
            <h2>{loading ? '—' : reports.length}</h2>
            <span>All submitted water issues</span>
          </article>

          <article className="analytics-stat-card">
            <span className="analytics-stat-icon">⏳</span>
            <p>Pending issues</p>
            <h2>{loading ? '—' : pendingCount}</h2>
            <span>Waiting for action</span>
          </article>
        </section>

        <section className="analytics-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AREA BREAKDOWN</p>
              <h2>Water issues by district</h2>
            </div>

            <span className="ai-badge">
              {loading ? 'Loading...' : `${areas.length} areas`}
            </span>
          </div>

          {loading && <p role="status">Loading area data...</p>}

          {error && (
            <p className="reports-error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && areas.length === 0 && (
            <p>No area data is available yet.</p>
          )}

          {!loading && !error && areas.length > 0 && (
            <div className="analytics-chart">
              {areas.map((area) => (
                <article
                  className="analytics-bar-row"
                  key={`${area.state}-${area.district}`}
                >
                  <div className="analytics-bar-label">
                    <span>
                      📍 {area.district}, {area.state}
                    </span>
                    <strong>{area.total} reports</strong>
                  </div>

                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width: `${(area.total / maxReports) * 100}%`,
                      }}
                    />
                  </div>

                  <p className="analytics-note">
                    Pending: {area.pending} · In Progress: {area.inProgress}
                    {' · '}Resolved: {area.resolved}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer>Hydroniq · Every drop matters.</footer>
      </main>
    </div>
  )
}

export default AreaMonitoring
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

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
      const state = report.state?.trim() || 'General Region'
      const district = report.district?.trim() || 'Central District'
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
      <Sidebar />

      <main className="main-content">
        <Link to="/" className="back-link">
          Back to dashboard
        </Link>

        <header className="topbar">
          <div>
            <p className="eyebrow">LOCATION INTELLIGENCE</p>
            <h1>Area Monitoring Overview</h1>
            <p className="subtitle">
              Monitor water issue density and resolution distribution across states and districts.
            </p>
          </div>

          <Link to="/reports" className="btn-secondary">
            All Reports
          </Link>
        </header>

        <section className="analytics-stats-grid">
          <article className="analytics-stat-card">
            <p>Active Regions</p>
            <h2>{loading ? '—' : areas.length}</h2>
            <span>Unique districts monitored</span>
          </article>

          <article className="analytics-stat-card">
            <p>Total Submissions</p>
            <h2>{loading ? '—' : reports.length}</h2>
            <span>All citizen water reports</span>
          </article>

          <article className="analytics-stat-card">
            <p>Pending Inquiries</p>
            <h2>{loading ? '—' : pendingCount}</h2>
            <span>Awaiting local response</span>
          </article>
        </section>

        <section className="analytics-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GEOGRAPHIC SPREAD</p>
              <h2>Water Problems by District</h2>
            </div>

            <span className="ai-badge">
              {loading ? 'Loading...' : `${areas.length} ${areas.length === 1 ? 'Area' : 'Areas'}`}
            </span>
          </div>

          {loading && (
            <p role="status" style={{ padding: '20px 0', color: '#0d9488', fontWeight: 600 }}>
              Aggregating location metrics from database...
            </p>
          )}

          {error && (
            <div className="alert-error" role="alert">
              <strong>Error Loading Data</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && areas.length === 0 && (
            <p className="section-description">No area data is available yet.</p>
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
                      Region: <strong>{area.district}</strong>, {area.state}
                    </span>
                    <strong>{area.total} {area.total === 1 ? 'report' : 'reports'}</strong>
                  </div>

                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width: `${Math.max(5, (area.total / maxReports) * 100)}%`,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className="status-badge pending" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      Pending: {area.pending}
                    </span>
                    <span className="status-badge in-progress" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      In Progress: {area.inProgress}
                    </span>
                    <span className="status-badge resolved" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      Resolved: {area.resolved}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer>Hydroniq · Open Infrastructure Platform</footer>
      </main>
    </div>
  )
}

export default AreaMonitoring
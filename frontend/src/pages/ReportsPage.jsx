import { useEffect, useState } from 'react'
import '../App.css'

const API_URL = 'http://127.0.0.1:8000/api/reports'

function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Could not load water reports.')
      }

      const data = await response.json()

      // Backend may return an array directly or an object containing reports.
      const reportList = Array.isArray(data) ? data : data.reports

      if (!Array.isArray(reportList)) {
        throw new Error('Unexpected response received from the backend.')
      }

      setReports(reportList)
    } catch (err) {
      setError(
        err.message ||
          'Unable to load reports. Please check that the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(reportId, newStatus) {
    const previousReports = reports

    try {
      setUpdatingId(reportId)
      setError('')

      const response = await fetch(
        `${API_URL}/${reportId}/status?status=${encodeURIComponent(newStatus)}`,
        { method: 'PATCH' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not update report status.')
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === reportId
            ? { ...report, status: data.status || newStatus }
            : report
        )
      )
    } catch (err) {
      setReports(previousReports)
      setError(err.message || 'Could not connect to the backend.')
      await fetchReports()
    } finally {
      setUpdatingId(null)
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Date unavailable'

    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) return 'Date unavailable'

    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const states = [
    ...new Set(reports.map((report) => report.state).filter(Boolean)),
  ].sort()

  const districts = [
    ...new Set(
      reports
        .filter(
          (report) =>
            stateFilter === 'All' || report.state === stateFilter
        )
        .map((report) => report.district)
        .filter(Boolean)
    ),
  ].sort()

  const query = searchTerm.trim().toLowerCase()

  const filteredReports = reports.filter((report) => {
    const matchesSearch = [
      report.id,
      report.issue_type,
      report.state,
      report.district,
      report.area,
      report.description,
      report.reporter_name,
      report.status,
    ].some((value) => String(value ?? '').toLowerCase().includes(query))

    const matchesStatus =
      statusFilter === 'All' || report.status === statusFilter

    const matchesState =
      stateFilter === 'All' || report.state === stateFilter

    const matchesDistrict =
      districtFilter === 'All' || report.district === districtFilter

    return (
      matchesSearch &&
      matchesStatus &&
      matchesState &&
      matchesDistrict
    )
  })

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">Hydroniq</h2>
        <p className="sidebar-label">WORKSPACE</p>

        <nav>
          <a className="nav-link" href="/">
            Dashboard
          </a>
          <a className="nav-link active" href="/reports">
            Water Reports
          </a>
          <a className="nav-link" href="/analytics">
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
            <p className="eyebrow">COMMUNITY ACTION</p>
            <h1>Water Reports</h1>
            <p className="subtitle">
              View and track water problems reported by the community.
            </p>
          </div>

          <span className="ai-badge">
            {filteredReports.length}{' '}
            {filteredReports.length === 1 ? 'report' : 'reports'}
            {searchTerm.trim() ||
            statusFilter !== 'All' ||
            stateFilter !== 'All' ||
            districtFilter !== 'All'
              ? ' found'
              : ''}
          </span>
        </header>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">REPORT TRACKER</p>
              <h2>Submitted complaints</h2>
            </div>

            <a className="primary-button" href="/report">
              + New report
            </a>
          </div>

          {!loading && !error && reports.length > 0 && (
            <div className="report-search">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search ID, issue, state, district, area..."
                aria-label="Search water reports"
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}

              <select
                className="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter reports by status"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                className="status-filter"
                value={stateFilter}
                onChange={(event) => {
                  setStateFilter(event.target.value)
                  setDistrictFilter('All')
                }}
                aria-label="Filter reports by state"
              >
                <option value="All">All states</option>
                {states.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>

              <select
                className="status-filter"
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
                aria-label="Filter reports by district"
              >
                <option value="All">All districts</option>
                {districts.map((districtName) => (
                  <option key={districtName} value={districtName}>
                    {districtName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading && (
            <p role="status">Loading reports from MySQL...</p>
          )}

          {error && (
            <div className="reports-error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="primary-button"
                onClick={fetchReports}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <p>
              No reports yet. Be the first to report a water problem.
            </p>
          )}

          {!loading &&
            !error &&
            reports.length > 0 &&
            filteredReports.length === 0 && (
              <p className="no-search-results">
                No reports match your search or filters. Try changing your
                search or choosing All.
              </p>
            )}

          {!loading && !error && filteredReports.length > 0 && (
            <div className="water-reports-list">
              {filteredReports.map((report) => (
                <article className="water-report-card" key={report.id}>
                  <div className="water-report-top">
                    <span className="report-id">
                      Report #{report.id}
                    </span>

                    <span
                      className={`report-status ${(report.status || 'Pending')
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {report.status || 'Pending'}
                    </span>
                  </div>

                  <h3>{report.issue_type || 'Water problem'}</h3>

                  {(report.state || report.district) && (
                    <p className="water-report-area">
                      🗺️ {[report.district, report.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}

                  <p className="water-report-area">
                    📍 {report.area || 'Area not provided'}
                  </p>

                  <p className="water-report-description">
                    {report.description}
                  </p>

                  <div className="report-status-controls">
                    <label htmlFor={`status-${report.id}`}>
                      Update status
                    </label>

                    <select
                      id={`status-${report.id}`}
                      value={report.status || 'Pending'}
                      disabled={updatingId === report.id}
                      onChange={(event) =>
                        handleStatusUpdate(report.id, event.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    {updatingId === report.id && (
                      <span role="status">Saving...</span>
                    )}
                  </div>

                  <div className="water-report-meta">
                    <span>
                      Reported by: {report.reporter_name || 'Anonymous'}
                    </span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>
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

export default ReportsPage

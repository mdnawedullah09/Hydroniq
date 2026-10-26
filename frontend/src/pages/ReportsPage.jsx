import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
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

    return matchesSearch && matchesStatus && matchesState && matchesDistrict
  })

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Link to="/" className="back-link">
          Back to dashboard
        </Link>

        <header className="topbar">
          <div>
            <p className="eyebrow">COMMUNITY WATER ACTION</p>
            <h1>Water Reports Feed</h1>
            <p className="subtitle">
              Live tracking and status management for community-reported water problems.
            </p>
          </div>

          <Link className="primary-button" to="/report">
            File New Report
          </Link>
        </header>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DATABASE RECORDS</p>
              <h2>Submitted Complaints</h2>
            </div>

            <span className="ai-badge">
              {filteredReports.length} {filteredReports.length === 1 ? 'Report' : 'Reports'}
              {searchTerm.trim() || statusFilter !== 'All' ? ' Filtered' : ''}
            </span>
          </div>

          <div className="report-search">
            <input
              type="search"
              className="form-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by ID, issue type, area, description, or reporter..."
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

          {loading && (
            <p role="status" style={{ padding: '20px 0', color: '#0d9488', fontWeight: 600 }}>
              Loading live records from database...
            </p>
          )}

          {error && (
            <div className="alert-error" role="alert">
              <strong>Data Load Error</strong>
              <p>{error}</p>
              <button
                type="button"
                className="primary-button"
                onClick={fetchReports}
                style={{ marginTop: '12px' }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="alert-success">
              <p>No reports currently recorded. Be the first to report a water problem.</p>
              <Link to="/report">Submit a report now</Link>
            </div>
          )}

          {!loading && !error && reports.length > 0 && filteredReports.length === 0 && (
            <div className="alert-error" style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}>
              <p>No reports match your current filter criteria. Try clearing search filters.</p>
            </div>
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

                  <div>
                    {(report.district || report.state) && (
                      <span className="water-report-area">
                        Region: {[report.district, report.state].filter(Boolean).join(', ')}
                      </span>
                    )}

                    <span className="water-report-area">
                      Area: {report.area || 'Not specified'}
                    </span>
                  </div>

                  <p className="water-report-description">
                    {report.description}
                  </p>

                  <div className="report-status-controls">
                    <label htmlFor={`status-${report.id}`}>
                      Status:
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
                      <span role="status" style={{ fontSize: '13px', color: '#0d9488', fontWeight: 600 }}>
                        Updating...
                      </span>
                    )}
                  </div>

                  <div className="water-report-meta">
                    <span>
                      Reporter: <strong>{report.reporter_name || 'Anonymous Citizen'}</strong>
                    </span>
                    <span>Date: {formatDate(report.created_at)}</span>
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

export default ReportsPage

import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import '../App.css'

const API_URL = 'http://127.0.0.1:8000'

const stateDistricts = {
  Bihar: [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai',
    'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga',
    'East Champaran', 'Gaya', 'Gopalganj', 'Jamui',
    'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria',
    'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani',
    'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada',
    'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
    'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
    'Supaul', 'Vaishali', 'West Champaran',
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ayodhya', 'Bareilly', 'Ghaziabad',
    'Gorakhpur', 'Kanpur Nagar', 'Lucknow', 'Mathura',
    'Meerut', 'Prayagraj', 'Varanasi', 'Gautam Buddha Nagar',
  ],
  'West Bengal': [
    'Bankura', 'Darjeeling', 'Hooghly', 'Howrah',
    'Jalpaiguri', 'Kolkata', 'Malda', 'Murshidabad',
    'Nadia', 'North 24 Parganas', 'South 24 Parganas',
  ],
  Jharkhand: [
    'Bokaro', 'Deoghar', 'Dhanbad', 'East Singhbhum',
    'Giridih', 'Hazaribagh', 'Ranchi', 'West Singhbhum',
  ],
  Delhi: [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
    'North East Delhi', 'North West Delhi', 'Shahdara',
    'South Delhi', 'South East Delhi', 'South West Delhi',
    'West Delhi',
  ],
}

const issueTypes = [
  { value: 'leaking_tap', label: 'Leaking public tap' },
  { value: 'broken_handpump', label: 'Broken handpump' },
  { value: 'water_supply', label: 'Water supply problem' },
  { value: 'overflowing_tank', label: 'Overflowing water tank' },
  { value: 'contamination', label: 'Possible water contamination' },
  { value: 'other', label: 'Other water problem' },
]

function ReportPage() {
  const [issueType, setIssueType] = useState('leaking_tap')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [reporterName, setReporterName] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState('')

  const availableDistricts = stateDistricts[state] || []

  function handleStateChange(event) {
    setState(event.target.value)
    setDistrict('')
    setError('')
    setAiResult(null)
  }

  async function handleAnalyze() {
    if (!state || !district || !area.trim() || !description.trim()) {
      setError(
        'Please select your state and district and fill in the area and description before AI analysis.'
      )
      return
    }

    setError('')
    setAiResult(null)
    setAiLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue_type: issueType,
          state,
          district,
          area: area.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'AI analysis failed. Please check the backend.'
        )
      }

      setAiResult(data)
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the AI service. Please check your backend and Ollama.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!state || !district || !area.trim() || !description.trim()) {
      setError(
        'Please fill in all required fields, including state and district.'
      )
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue_type: issueType,
          state,
          district,
          area: area.trim(),
          description: description.trim(),
          reporter_name: reporterName.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Could not submit your report.'
        )
      }

      setResult({
        success: true,
        message:
          data.message || 'Your water problem report was submitted successfully.',
        reportId: data.report_id ?? data.id ?? null,
      })

      setIssueType('leaking_tap')
      setState('')
      setDistrict('')
      setArea('')
      setDescription('')
      setReporterName('')
      setAiResult(null)
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the server. Please check your backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  const markdownContent =
    typeof aiResult === 'string'
      ? aiResult
      : aiResult?.analysis ||
        aiResult?.result ||
        aiResult?.message ||
        (aiResult ? JSON.stringify(aiResult, null, 2) : '')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">H</div>
          <div>
            <h2>Hydroniq</h2>
            <p>Water Intelligence</p>
          </div>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/reports">Water Reports</Link>
          <Link to="/analytics">Impact Analytics</Link>
          <Link to="/area-monitoring">Area Monitoring</Link>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <div>
            <strong>Local AI</strong>
            <p>Powered by open-source AI</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">COMMUNITY WATER CARE</p>
            <h1>Report a Water Problem</h1>
            <p className="page-subtitle">
              Help your community identify water problems and reduce water
              waste. Submit a report so it can be tracked and reviewed.
            </p>
          </div>

          <Link to="/reports" className="btn-secondary">
            View Reports
          </Link>
        </header>

        {result?.success && (
          <div className="alert-success" role="status">
            <h2>Report submitted successfully!</h2>
            <p>{result.message}</p>
            {result.reportId != null && (
              <p>Report ID: #{result.reportId}</p>
            )}
            <p>You can track your report from the Reports page.</p>
            <Link to="/reports">View submitted reports</Link>
          </div>
        )}

        {error && (
          <div className="alert-error" role="alert">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        <section className="content-card report-form-card">
          <div className="section-heading">
            <div>
              <h2>Problem Details</h2>
              <p>Tell us what happened and where it happened.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="issueType">Type of water problem *</label>
                <select
                  id="issueType"
                  className="form-input"
                  value={issueType}
                  onChange={(event) => {
                    setIssueType(event.target.value)
                    setAiResult(null)
                    setError('')
                  }}
                  required
                >
                  {issueTypes.map((issue) => (
                    <option key={issue.value} value={issue.value}>
                      {issue.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="state">State / UT *</label>
                <select
                  id="state"
                  className="form-input"
                  value={state}
                  onChange={handleStateChange}
                  required
                >
                  <option value="">Select state / UT</option>
                  {Object.keys(stateDistricts)
                    .sort()
                    .map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                </select>
                <p className="field-help">
                  More states and districts can be added later.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="district">District *</label>
                <select
                  id="district"
                  className="form-input"
                  value={district}
                  onChange={(event) => {
                    setDistrict(event.target.value)
                    setAiResult(null)
                    setError('')
                  }}
                  disabled={!state}
                  required
                >
                  <option value="">
                    {state ? 'Select district' : 'Select state first'}
                  </option>
                  {availableDistricts.map((districtName) => (
                    <option key={districtName} value={districtName}>
                      {districtName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="area">Area / Locality *</label>
                <input
                  id="area"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gandhi Maidan, Ward 5"
                  value={area}
                  onChange={(event) => {
                    setArea(event.target.value)
                    setAiResult(null)
                    setError('')
                  }}
                  maxLength={150}
                  required
                />
                <p className="field-help">
                  Enter your street, neighbourhood, ward or nearby landmark.
                </p>
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="description">Describe the problem *</label>
                <textarea
                  id="description"
                  className="form-input"
                  rows={5}
                  placeholder="Explain what happened, where you noticed it, and how serious it appears..."
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                    setAiResult(null)
                    setError('')
                  }}
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="reporterName">Your name (optional)</label>
                <input
                  id="reporterName"
                  type="text"
                  className="form-input"
                  placeholder="Enter your name or leave blank to report anonymously"
                  value={reporterName}
                  onChange={(event) => setReporterName(event.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="ai-assist-panel">
              <h3>AI-powered assistance</h3>
              <p>
                Gemma can help summarize the reported problem and suggest
                possible next steps. Its analysis is a suggestion, not a
                verified diagnosis.
              </p>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleAnalyze}
                disabled={aiLoading || loading}
              >
                {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>

            {aiResult && (
              <div className="ai-result-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">LOCAL AI ASSISTANT</p>
                    <h2>AI Analysis</h2>
                  </div>
                </div>

                <div className="ai-markdown">
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>

                <p className="field-help">
                  Please have a person review this analysis before taking
                  action.
                </p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || aiLoading}
              >
                {loading ? 'Submitting Report...' : 'Submit Water Problem Report'}
              </button>
            </div>

            <p className="form-note">Fields marked with * are required.</p>
          </form>
        </section>

        <footer className="page-footer">
          Hydroniq · Every drop matters.
        </footer>
      </main>
    </div>
  )
}

export default ReportPage

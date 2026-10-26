import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import Sidebar from '../components/Sidebar'
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
        'Please select state and district and fill in the area and description before analysis.'
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
        throw new Error(data.detail || 'Could not complete AI analysis.')
      }

      setAiResult(data)
    } catch (err) {
      setError(
        err.message || 'AI service unavailable. Please check backend.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!area.trim() || !description.trim()) {
      setError('Please provide both the area and problem description.')
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
          state: state || null,
          district: district || null,
          area: area.trim(),
          description: description.trim(),
          reporter_name: reporterName.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit report.')
      }

      setResult({
        success: true,
        message: data.message || 'Your water problem report was submitted successfully.',
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
        err.message || 'Could not connect to the server. Please check your backend.'
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
      <Sidebar />

      <main className="main-content">
        <Link to="/" className="back-link">
          Back to dashboard
        </Link>

        <header className="topbar">
          <div>
            <p className="eyebrow">CITIZEN FORM</p>
            <h1>Report a Water Problem</h1>
            <p className="page-subtitle">
              Submit location details and problem description to notify the municipal authority.
            </p>
          </div>

          <Link to="/reports" className="btn-secondary">
            View Reports
          </Link>
        </header>

        {result?.success && (
          <div className="alert-success" role="status">
            <h2>Report submitted successfully</h2>
            <p>{result.message}</p>
            {result.reportId != null && (
              <p><strong>Tracking ID: #{result.reportId}</strong></p>
            )}
            <p>You can track resolution progress in the reports feed.</p>
            <Link to="/reports">View submitted reports</Link>
          </div>
        )}

        {error && (
          <div className="alert-error" role="alert">
            <strong>Action Required</strong>
            <p>{error}</p>
          </div>
        )}

        <section className="report-form-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SECTION 1</p>
              <h2>Problem Details</h2>
            </div>
            <p className="field-help">Fields marked with * are required</p>
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
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="description">Describe the problem in detail *</label>
                <textarea
                  id="description"
                  className="form-input"
                  rows={4}
                  placeholder="Explain what happened, nearby landmarks, how long it has been running, and its severity..."
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
                <label htmlFor="reporterName">Your name or organization (optional)</label>
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
              <div className="section-heading" style={{ marginBottom: '8px' }}>
                <div>
                  <p className="eyebrow">AUTOMATED ASSISTANT</p>
                  <h3>AI Categorization & Completeness Check</h3>
                </div>
                <span className="ai-badge">Local Processing</span>
              </div>
              <p>
                Run automated analysis to verify classification accuracy and identify any missing details before submission.
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
                    <p className="eyebrow">ASSESSMENT RESULT</p>
                    <h2>Pre-Submission Assessment</h2>
                  </div>
                  <span className="ai-badge">Ollama Gemma</span>
                </div>

                <div className="ai-markdown">
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>

                <p className="field-help" style={{ marginTop: '12px' }}>
                  AI analysis is an advisory recommendation intended for human review.
                </p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={loading || aiLoading}
              >
                {loading ? 'Submitting...' : 'Submit Water Problem Report'}
              </button>
            </div>
          </form>
        </section>

        <footer>Hydroniq · Open Infrastructure Platform</footer>
      </main>
    </div>
  )
}

export default ReportPage

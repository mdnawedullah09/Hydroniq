import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/reports', label: 'Water Reports' },
    { to: '/report', label: 'Report Problem' },
    { to: '/analytics', label: 'Impact Analytics' },
    { to: '/area-monitoring', label: 'Area Monitoring' },
  ]

  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-icon-wrap" aria-hidden="true">
          <span className="brand-letter">H</span>
        </div>
        <div className="brand-text-block">
          <h2 className="brand-title">Hydroniq</h2>
          <span className="brand-tagline">Water Intelligence Platform</span>
        </div>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav-list" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = path === item.to
          return (
            <Link
              key={item.to}
              className={`nav-link ${isActive ? 'active' : ''}`}
              to={item.to}
            >
              <span className="nav-text">{item.label}</span>
              {isActive && <span className="nav-active-pill" />}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="ai-status-row">
          <span className="status-pulse-dot" />
          <span className="status-status-text">Ollama Gemma Model</span>
        </div>
        <p className="sidebar-footnote">Local Inference Active</p>
      </div>
    </aside>
  )
}

export default Sidebar

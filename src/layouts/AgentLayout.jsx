import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  FileBarChart,
  Megaphone,
  Menu,
  Bell,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'


const navigation = [
  { label: 'My overview', path: '/agent', icon: LayoutDashboard, end: true },
  { label: 'My tasks', path: '/agent/tasks', icon: ClipboardList },
  { label: 'My assigned areas', path: '/agent/areas', icon: MapPin },
  { label: 'Field reports', path: '/agent/reports', icon: FileBarChart },
  { label: 'Announcements', path: '/agent/announcements', icon: Megaphone },
]

function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'U'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="workspace agent-workspace">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`workspace-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Link to="/" className="workspace-brand">
          <span className="brand-mark">M</span>
          <span className="brand-name">
            MATUNGULU
            <small>FIELD TEAM</small>
          </span>
        </Link>

        <div className="sidebar-section-label">FIELD WORKSPACE</div>

        <nav className="workspace-navigation">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `workspace-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="workspace-user">
          <div className="user-avatar agent-avatar">{initials}</div>
          <div>
            <strong>{user?.full_name || 'Field agent'}</strong>
            <small>Field agent</small>
          </div>
        </div>

        <Link to="/" className="workspace-exit">
          <ExternalLink size={17}/>
          <span>Public website</span>
        </Link>

        <button
            type="button"
            className="workspace-exit workspace-logout"
            onClick={handleLogout}
        >
          <LogOut size={17}/>
          <span>Sign out</span>
        </button>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
        <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            <Menu size={21} />
          </button>

          <div className="topbar-heading">
            <span>MATUNGULU CAMPAIGN</span>
            <strong>Field agent workspace</strong>
          </div>

          <div className="topbar-actions">
            <button className="topbar-icon" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <span className="topbar-avatar agent-avatar">{initials}</span>
          </div>
        </header>

        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AgentLayout

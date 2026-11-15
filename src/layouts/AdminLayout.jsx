import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Newspaper,
  Image,
  CalendarDays,
  FileText,
  MessageSquare,
  Users,
  Settings,
  Menu,
  Bell,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navigation = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Website content', path: '/admin/content', icon: Newspaper },
  { label: 'Media library', path: '/admin/media', icon: Image },
  { label: 'Campaign events', path: '/admin/events', icon: CalendarDays },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Field tasks', path: '/admin/tasks', icon: CalendarDays },
  { label: 'Assigned areas', path: '/admin/areas', icon: Users },
  { label: 'Field reports', path: '/admin/reports', icon: FileText },
  { label: 'Announcements', path: '/admin/announcements', icon: Bell },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare, adminOnly: true },
  { label: 'Team & editors', path: '/admin/team', icon: Users, adminOnly: true },
  { label: 'Settings', path: '/admin/settings', icon: Settings, adminOnly: true },
  { label: 'Campaign posters', path: '/admin/posters', icon: Image },
  { label: 'Site navigation', path: '/admin/navigation', icon: Menu, adminOnly: true },
]

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
const { user, logout } = useAuth()
const navigate = useNavigate()
  const visibleNavigation = navigation.filter(
      (item) => !item.adminOnly || ['admin', 'mp'].includes(user?.role)
  )
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
    <div className="workspace admin-workspace">
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
            <small>CAMPAIGN</small>
          </span>
        </Link>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="workspace-navigation">
          {visibleNavigation.map(({ label, path, icon: Icon, end }) => (
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
          <div className="user-avatar">{initials}</div>
          <div>
            <strong>{user?.full_name || 'Workspace user'}</strong>
            <small>
              {user?.role === 'admin'
                  ? 'Administrator'
                  : user?.role === 'mp'
                      ? 'Member of Parliament'
                      : 'Editor'}
            </small>
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
            <strong>Administration</strong>
          </div>

          <div className="topbar-actions">
            <button className="topbar-icon" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <span className="topbar-avatar">{initials}</span>
          </div>
        </header>

        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

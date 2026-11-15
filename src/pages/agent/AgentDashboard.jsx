import {
  ClipboardList,
  MapPin,
  FileBarChart,
  Megaphone,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const agentCards = [
  {
    label: 'Assigned tasks',
    value: 'Not connected',
    icon: ClipboardList,
    path: '/agent/tasks',
  },
  {
    label: 'Assigned areas',
    value: 'Not connected',
    icon: MapPin,
    path: '/agent/areas',
  },
  {
    label: 'Submitted reports',
    value: 'Not connected',
    icon: FileBarChart,
    path: '/agent/reports',
  },
]

function AgentDashboard() {
  return (
    <div className="dashboard-page agent-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">FIELD TEAM</span>
          <h1>My workspace</h1>
          <p>View your assignments and manage your field activities.</p>
        </div>
        <span className="agent-account-label">AGENT ACCOUNT</span>
      </div>

      <section className="overview-grid">
        {agentCards.map(({ label, value, icon: Icon, path }) => (
          <Link to={path} className="overview-card agent-overview-card" key={label}>
            <div className="overview-card-top">
              <span>{label}</span>
              <Icon size={20} />
            </div>
            <strong>{value}</strong>
            <small>Waiting for backend connection</small>
            <ArrowRight className="overview-arrow" size={17} />
          </Link>
        ))}
      </section>

      <section className="agent-welcome-panel">
        <div>
          <span className="eyebrow">YOUR FIELD WORKSPACE</span>
          <h2>Stay organised. Keep your reports up to date.</h2>
          <p>
            Your assigned tasks, locations, reports, and campaign
            announcements will be available in this workspace.
          </p>
        </div>
        <div className="agent-welcome-icon">
          <Megaphone size={35} strokeWidth={1.3} />
        </div>
      </section>
    </div>
  )
}

export default AgentDashboard

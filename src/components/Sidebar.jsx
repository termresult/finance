import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  School,
  FileText,
  BellRing,
  BadgeCheck,
  Settings,
  GraduationCap,
} from 'lucide-react'

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schools', label: 'Schools', icon: School },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: BellRing, badgeKey: 'remindersDue' },
  { to: '/confirm-payment', label: 'Confirm Payment', icon: BadgeCheck, badgeKey: 'overdueCount' },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onNavigate, badges = {} }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <img src="/brand/termresult-favicon.png" alt="TermResult" />
        <div className="brand-copy">
          <strong>
            <span>Term</span>Result
          </strong>
          <small>Financial Management</small>
        </div>
      </div>

      <nav>
        <p className="nav-section-label">Admin</p>
        <div className="nav-list">
          {adminLinks.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onNavigate}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badgeKey && badges[badgeKey] > 0 ? (
                <span className="badge">{badges[badgeKey]}</span>
              ) : null}
            </NavLink>
          ))}
        </div>

        <p className="nav-section-label" style={{ marginTop: 22 }}>
          Coming later
        </p>
        <div className="nav-list">
          <NavLink
            to="/school-portal"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <GraduationCap size={18} />
            <span>School Portal</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <p>Connected to TermResult</p>
        <span>Billing layer for subscribed schools — invoices, reminders, and manual confirmation.</span>
      </div>
    </aside>
  )
}

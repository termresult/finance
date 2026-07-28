import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  School,
  FileText,
  BellRing,
  BadgeCheck,
  Settings,
  LogOut,
} from 'lucide-react'
import { getFinanceAdmin } from '../services/api'

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schools', label: 'Schools', icon: School },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: BellRing, badgeKey: 'remindersDue' },
  { to: '/confirm-payment', label: 'Confirm Payment', icon: BadgeCheck, badgeKey: 'overdueCount' },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onNavigate, badges = {}, onLogout }) {
  const admin = getFinanceAdmin()
  const name = admin?.full_name || 'Finance Admin'
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2)

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

      <nav className="sidebar-nav">
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
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials || 'FA'}</div>
          <div className="sidebar-user-copy">
            <strong>{name}</strong>
            <small>{admin?.email || 'Finance desk'}</small>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-logout"
          onClick={() => {
            onNavigate?.()
            onLogout?.()
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

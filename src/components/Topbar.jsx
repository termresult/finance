import { Bell, Menu } from 'lucide-react'

export default function Topbar({ title, subtitle, onMenu, admin }) {
  const name = admin?.full_name || 'Finance Admin'
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2)

  return (
    <header className="topbar">
      <div className="topbar-title-row">
        <button className="icon-btn mobile-toggle" onClick={onMenu} aria-label="Open menu" type="button">
          <Menu size={18} />
        </button>
        <div className="topbar-heading">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Notifications" type="button">
          <Bell size={16} />
        </button>
        <div className="user-chip" title={name}>
          <div className="user-avatar">{initials || 'FA'}</div>
          <span>
            <strong>{name}</strong>
          </span>
        </div>
      </div>
    </header>
  )
}

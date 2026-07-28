import { Bell, LogOut, Menu, Search } from 'lucide-react'

export default function Topbar({ title, subtitle, onMenu, onLogout }) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button className="icon-btn mobile-toggle" onClick={onMenu} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={16} />
          <input type="search" placeholder="Search schools, invoices…" />
        </label>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="user-chip">
          <div className="user-avatar">AD</div>
          <span>
            <strong>Admin Desk</strong>
            <small>TermResult Finance</small>
          </span>
        </div>
        <button className="icon-btn" onClick={onLogout} aria-label="Sign out" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

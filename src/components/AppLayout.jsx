import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { getFinanceAdmin } from '../services/api'

const titles = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Collections, outstanding balances, and reminder activity.',
  },
  '/schools': {
    title: 'Schools',
    subtitle: 'Active TermResult schools and billing profiles.',
  },
  '/invoices': {
    title: 'Invoices',
    subtitle: 'Generate and track school billing invoices.',
  },
  '/reminders': {
    title: 'Reminders',
    subtitle: 'Schedule and review payment reminders.',
  },
  '/confirm-payment': {
    title: 'Confirm Payment',
    subtitle: 'Verify bank transfers and mark invoices paid.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Billing defaults, settlement, and finance admins.',
  },
}

export default function AppLayout({ badges, onLogout }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = titles[pathname] || titles['/']
  const admin = getFinanceAdmin()

  return (
    <div className="app-shell">
      <Sidebar
        open={open}
        onNavigate={() => setOpen(false)}
        badges={badges}
        onLogout={onLogout}
      />
      {open ? (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      ) : null}
      <div className="main-area">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenu={() => setOpen((v) => !v)}
          admin={admin}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

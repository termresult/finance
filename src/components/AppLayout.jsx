import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const titles = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Overview of collections, outstanding balances, and reminder activity.',
  },
  '/schools': {
    title: 'Schools',
    subtitle: 'Subscribed schools linked from TermResult.',
  },
  '/invoices': {
    title: 'Invoices',
    subtitle: 'Generate, track, and review school billing invoices.',
  },
  '/reminders': {
    title: 'Reminders',
    subtitle: 'Schedule and review email & WhatsApp payment reminders.',
  },
  '/confirm-payment': {
    title: 'Confirm Payment',
    subtitle: 'Manually verify bank transfers and mark invoices as paid.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Billing defaults, reminder preferences, and admin profile.',
  },
  '/school-portal': {
    title: 'School Portal',
    subtitle: 'Reserved for the future school-facing experience.',
  },
}

export default function AppLayout({ badges, onLogout }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = titles[pathname] || titles['/']

  return (
    <div className="app-shell">
      <Sidebar open={open} onNavigate={() => setOpen(false)} badges={badges} />
      {open ? (
        <div
          className="modal-backdrop"
          style={{ zIndex: 30 }}
          onClick={() => setOpen(false)}
          role="presentation"
        />
      ) : null}
      <div className="main-area">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenu={() => setOpen((v) => !v)}
          onLogout={onLogout}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

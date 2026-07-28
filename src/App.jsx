import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import AppLayout from './components/AppLayout'
import { useFinanceStore } from './hooks/useFinanceStore'
import Dashboard from './pages/Dashboard'
import Schools from './pages/Schools'
import Invoices from './pages/Invoices'
import Reminders from './pages/Reminders'
import ConfirmPayment from './pages/ConfirmPayment'
import Settings from './pages/Settings'
import SchoolPortal from './pages/SchoolPortal'
import Login from './pages/Login'

export default function App() {
  const store = useFinanceStore()
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('termresult-admin') === 'authenticated',
  )

  function login() {
    sessionStorage.setItem('termresult-admin', 'authenticated')
    setAuthenticated(true)
  }

  function logout() {
    sessionStorage.removeItem('termresult-admin')
    setAuthenticated(false)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authenticated ? <Navigate to="/" replace /> : <Login onLogin={login} />
          }
        />
        {!authenticated ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
        <Route
          element={
            <AppLayout
              onLogout={logout}
              badges={{
                remindersDue: store.stats.remindersDue,
                overdueCount: store.stats.overdueCount,
              }}
            />
          }
        >
          <Route
            index
            element={
              <Dashboard
                stats={store.stats}
                invoices={store.invoices}
                schools={store.schools}
                schoolMap={store.schoolMap}
                reminders={store.reminders}
              />
            }
          />
          <Route
            path="schools"
            element={
              <Schools
                schools={store.schools}
                invoices={store.invoices}
                updateSchoolPrice={store.updateSchoolPrice}
              />
            }
          />
          <Route
            path="invoices"
            element={
              <Invoices
                invoices={store.invoices}
                schools={store.schools}
                schoolMap={store.schoolMap}
                createInvoice={store.createInvoice}
                deliveries={store.deliveries}
                deleteInvoice={store.deleteInvoice}
              />
            }
          />
          <Route
            path="reminders"
            element={
              <Reminders
                reminders={store.reminders}
                invoices={store.invoices}
                schoolMap={store.schoolMap}
                scheduleReminder={store.scheduleReminder}
                markReminderSent={store.markReminderSent}
              />
            }
          />
          <Route
            path="confirm-payment"
            element={
              <ConfirmPayment
                invoices={store.invoices}
                schoolMap={store.schoolMap}
                confirmPayment={store.confirmPayment}
              />
            }
          />
          <Route path="settings" element={<Settings showToast={store.showToast} />} />
          <Route path="school-portal" element={<SchoolPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        )}
      </Routes>

      {store.toast ? (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {store.toast}
        </div>
      ) : null}
    </BrowserRouter>
  )
}

import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import AppLayout from './components/AppLayout'
import { useFinanceStore, useToast } from './hooks/useFinanceStore'
import Dashboard from './pages/Dashboard'
import Schools from './pages/Schools'
import Invoices from './pages/Invoices'
import Reminders from './pages/Reminders'
import ConfirmPayment from './pages/ConfirmPayment'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Setup from './pages/Setup'
import {
  clearFinanceSession,
  financeAuth,
  isFinanceAuthenticated,
} from './services/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
})

function AuthenticatedApp({ onLogout }) {
  const { toast, showToast } = useToast()
  const store = useFinanceStore(showToast)

  return (
    <>
      <Routes>
        <Route
          element={
            <AppLayout
              onLogout={onLogout}
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
                loading={store.loading}
                stats={store.stats}
                invoices={store.invoices}
                schools={store.schools}
                schoolMap={store.schoolMap}
                reminders={store.reminders}
                revenueSeries={store.revenueSeries}
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
                settings={store.settings}
                createInvoice={store.createInvoice}
                deliveries={store.deliveries}
                deleteInvoice={store.deleteInvoice}
                sendInvoiceEmail={store.sendInvoiceEmail}
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
                sendReminderEmail={store.sendReminderEmail}
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
          <Route
            path="settings"
            element={
              <Settings
                settings={store.settings}
                saveSettings={store.saveSettings}
                showToast={showToast}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {toast ? (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      ) : null}
    </>
  )
}

function AuthGate() {
  const [authenticated, setAuthenticated] = useState(() => isFinanceAuthenticated())
  const [hasAdmin, setHasAdmin] = useState(null)
  const [bootError, setBootError] = useState('')

  useEffect(() => {
    let cancelled = false
    financeAuth
      .exists()
      .then((res) => {
        if (!cancelled) setHasAdmin(Boolean(res.data?.data?.has_admin))
      })
      .catch(() => {
        if (!cancelled) {
          setHasAdmin(false)
          setBootError('Could not reach the finance API. Is the backend running?')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function login() {
    setAuthenticated(true)
    setHasAdmin(true)
  }

  async function logout() {
    try {
      await financeAuth.logout()
    } catch {
      // ignore
    }
    clearFinanceSession()
    setAuthenticated(false)
  }

  if (hasAdmin === null && !authenticated) {
    return (
      <main className="login-page">
        <section className="login-form-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="login-card">
            <p>Checking finance setup…</p>
            {bootError ? <div className="login-error">{bootError}</div> : null}
          </div>
        </section>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path="/setup"
        element={
          authenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Setup onLogin={login} hasAdmin={hasAdmin} />
          )
        }
      />
      <Route
        path="/login"
        element={
          authenticated ? (
            <Navigate to="/" replace />
          ) : hasAdmin === false ? (
            <Navigate to="/setup" replace />
          ) : (
            <Login onLogin={login} />
          )
        }
      />
      {!authenticated ? (
        <Route
          path="*"
          element={<Navigate to={hasAdmin === false ? '/setup' : '/login'} replace />}
        />
      ) : (
        <Route path="*" element={<AuthenticatedApp onLogout={logout} />} />
      )}
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  apiErrorMessage,
  financeAuth,
  setFinanceSession,
} from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await financeAuth.login({
        email: email.trim(),
        password,
      })
      const data = res.data.data
      setFinanceSession({ token: data.token, admin: data.admin })
      onLogin(data.admin)
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid email or password.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <img src="/brand/termresult-logo-no-bg.png" alt="TermResult" />
        <div>
          <span className="login-kicker">Financial management</span>
          <h1>School billing, made clear and automatic.</h1>
          <p>
            Generate accurate invoices, schedule friendly reminders, and confirm
            payments from one secure workspace.
          </p>
        </div>
        <small>TermResult Nexus Limited</small>
      </section>

      <section className="login-form-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-icon">
            <LockKeyhole size={22} />
          </div>
          <span className="login-kicker">Finance administrator</span>
          <h2>Welcome back</h2>
          <p>Sign in with your finance admin email and password.</p>

          <label className="field-label">
            Email
            <input
              className={`field ${error ? 'invalid' : ''}`}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              placeholder="you@termresult.com"
              autoFocus
              required
            />
          </label>

          <label className="field-label">
            Password
            <div className={`password-field ${error ? 'invalid' : ''}`}>
              <input
                type={visible ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error ? <div className="login-error">{error}</div> : null}

          <button className="btn btn-primary login-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
            First time? <Link to="/setup">Complete finance setup</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

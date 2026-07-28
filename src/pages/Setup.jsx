import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import {
  apiErrorMessage,
  financeAuth,
  setFinanceSession,
} from '../services/api'

export default function Setup({ onLogin, hasAdmin }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    setup_key: '',
  })
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (hasAdmin === true) {
    return <Navigate to="/login" replace />
  }

  async function submit(event) {
    event.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await financeAuth.setup({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        setup_key: form.setup_key || undefined,
      })
      const data = res.data.data
      setFinanceSession({ token: data.token, admin: data.admin })
      onLogin(data.admin)
    } catch (err) {
      setError(apiErrorMessage(err, 'Setup failed.'))
    } finally {
      setBusy(false)
    }
  }

  function update(field) {
    return (event) => {
      setForm((f) => ({ ...f, [field]: event.target.value }))
      setError('')
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <img src="/brand/termresult-logo-no-bg.png" alt="TermResult" />
        <div>
          <span className="login-kicker">First-time setup</span>
          <h1>Create the finance administrator account.</h1>
          <p>
            This unlocks school subscription billing — invoices per session and term,
            reminders, and payment confirmation.
          </p>
        </div>
        <small>TermResult Nexus Limited</small>
      </section>

      <section className="login-form-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-icon">
            <ShieldCheck size={22} />
          </div>
          <span className="login-kicker">Finance setup</span>
          <h2>Register finance admin</h2>
          <p>One-time setup for the TermResult finance workspace.</p>

          <label className="field-label">
            Full name
            <input
              className="field"
              value={form.full_name}
              onChange={update('full_name')}
              required
              autoFocus
            />
          </label>

          <label className="field-label">
            Email
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={update('email')}
              required
            />
          </label>

          <label className="field-label">
            Password
            <div className="password-field">
              <input
                type={visible ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="field-label">
            Confirm password
            <input
              className="field"
              type={visible ? 'text' : 'password'}
              value={form.password_confirmation}
              onChange={update('password_confirmation')}
              minLength={8}
              required
            />
          </label>

          <label className="field-label">
            Setup key
            <input
              className="field"
              value={form.setup_key}
              onChange={update('setup_key')}
              placeholder="Required in production"
            />
            <span className="muted">Leave blank in local development.</span>
          </label>

          {error ? <div className="login-error">{error}</div> : null}

          <button className="btn btn-primary login-submit" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create finance admin'}
          </button>

          <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
            Already set up? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

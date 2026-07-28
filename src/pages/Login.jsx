import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { validateTemporaryPassword } from '../lib/billing'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!validateTemporaryPassword(password)) {
      setError('Incorrect password. Please try again.')
      return
    }
    onLogin()
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
          <span className="login-kicker">Administrator access</span>
          <h2>Welcome back</h2>
          <p>Enter the temporary admin password to continue.</p>

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
                autoFocus
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

          <button className="btn btn-primary login-submit" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}

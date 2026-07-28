import { useState } from 'react'

export default function Settings({ showToast }) {
  const [form, setForm] = useState({
    orgName: 'TermResult Finance',
    supportEmail: 'billing@termresult.com',
    defaultDueDays: 14,
    emailReminders: true,
    whatsappReminders: true,
    reminderLeadDays: 3,
    bankName: 'First Bank of Nigeria',
    accountName: 'TermResult Technologies',
    accountNumber: '2033441189',
  })

  function save(e) {
    e.preventDefault()
    showToast('Settings saved (local preview)')
  }

  return (
    <div className="page-stack">
      <form className="panel" onSubmit={save}>
        <div className="panel-header">
          <div>
            <h2>Billing defaults</h2>
            <p>These values will map to Flask settings once the API is connected</p>
          </div>
          <button className="btn btn-primary" type="submit">
            Save changes
          </button>
        </div>
        <div className="panel-body">
          <div className="form-grid">
            <label className="field-label">
              Organisation name
              <input
                className="field"
                value={form.orgName}
                onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
              />
            </label>
            <label className="field-label">
              Support email
              <input
                className="field"
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
              />
            </label>
            <label className="field-label">
              Default due days
              <input
                className="field"
                type="number"
                min="1"
                value={form.defaultDueDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defaultDueDays: Number(e.target.value) }))
                }
              />
            </label>
            <label className="field-label">
              Reminder lead days
              <input
                className="field"
                type="number"
                min="1"
                value={form.reminderLeadDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reminderLeadDays: Number(e.target.value) }))
                }
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.emailReminders}
                onChange={(e) => setForm((f) => ({ ...f, emailReminders: e.target.checked }))}
              />
              Enable email reminders
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.whatsappReminders}
                onChange={(e) => setForm((f) => ({ ...f, whatsappReminders: e.target.checked }))}
              />
              Enable WhatsApp reminders
            </label>
          </div>
        </div>
      </form>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Settlement account</h2>
            <p>Shown on invoices for school bank transfers</p>
          </div>
        </div>
        <div className="panel-body">
          <div className="form-grid">
            <label className="field-label">
              Bank name
              <input
                className="field"
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </label>
            <label className="field-label">
              Account name
              <input
                className="field"
                value={form.accountName}
                onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
              />
            </label>
            <label className="field-label full">
              Account number
              <input
                className="field"
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}

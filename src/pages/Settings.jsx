import { useEffect, useState } from 'react'
import { Landmark, Settings2, Shield, SlidersHorizontal } from 'lucide-react'
import ManageAdminsTab from './settings/ManageAdminsTab'

const tabs = [
  { id: 'billing', name: 'Billing defaults', icon: Settings2 },
  { id: 'settlement', name: 'Settlement account', icon: Landmark },
  { id: 'manage-admins', name: 'Manage Admins', icon: Shield },
]

function BillingDefaultsTab({ settings, saveSettings }) {
  const [form, setForm] = useState({
    organization_name: '',
    support_email: '',
    default_due_days: 14,
    reminder_email_enabled: true,
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!settings) return
    setForm({
      organization_name: settings.organization_name || '',
      support_email: settings.support_email || '',
      default_due_days: settings.default_due_days ?? 14,
      reminder_email_enabled: Boolean(settings.reminder_email_enabled),
    })
  }, [settings])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await saveSettings({
        organization_name: form.organization_name,
        support_email: form.support_email,
        default_due_days: form.default_due_days,
        reminder_email_enabled: form.reminder_email_enabled,
        reminder_whatsapp_enabled: false,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel" onSubmit={save}>
      <div className="panel-header">
        <div>
          <h2>Billing defaults</h2>
          <p>Organisation details, due dates, and reminder preferences</p>
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <label className="field-label">
            Organisation name
            <input
              className="field"
              value={form.organization_name}
              onChange={(e) => setForm((f) => ({ ...f, organization_name: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Support email
            <input
              className="field"
              type="email"
              value={form.support_email}
              onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Default due days
            <input
              className="field"
              type="number"
              min="1"
              value={form.default_due_days}
              onChange={(e) =>
                setForm((f) => ({ ...f, default_due_days: Number(e.target.value) }))
              }
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={form.reminder_email_enabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, reminder_email_enabled: e.target.checked }))
              }
            />
            Enable email reminders
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              opacity: 0.55,
            }}
          >
            <input type="checkbox" checked={false} disabled />
            WhatsApp reminders (coming later)
          </label>
        </div>
      </div>
    </form>
  )
}

function SettlementTab({ settings, saveSettings }) {
  const [form, setForm] = useState({
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!settings) return
    setForm({
      bank_name: settings.bank_name || '',
      bank_account_name: settings.bank_account_name || '',
      bank_account_number: settings.bank_account_number || '',
    })
  }, [settings])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await saveSettings({
        bank_name: form.bank_name,
        bank_account_name: form.bank_account_name,
        bank_account_number: form.bank_account_number,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel" onSubmit={save}>
      <div className="panel-header">
        <div>
          <h2>Settlement account</h2>
          <p>Shown on invoice emails for school bank transfers</p>
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <label className="field-label">
            Bank name
            <input
              className="field"
              value={form.bank_name}
              onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Account name
            <input
              className="field"
              value={form.bank_account_name}
              onChange={(e) => setForm((f) => ({ ...f, bank_account_name: e.target.value }))}
            />
          </label>
          <label className="field-label full">
            Account number
            <input
              className="field"
              value={form.bank_account_number}
              onChange={(e) => setForm((f) => ({ ...f, bank_account_number: e.target.value }))}
            />
          </label>
        </div>
      </div>
    </form>
  )
}

export default function Settings({ settings, saveSettings, showToast }) {
  const [activeTab, setActiveTab] = useState('billing')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeMeta = tabs.find((t) => t.id === activeTab) || tabs[0]

  function selectTab(id) {
    setActiveTab(id)
    setDrawerOpen(false)
  }

  return (
    <div className="settings-shell">
      <div className="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => selectTab(tab.id)}
            >
              <Icon size={14} />
              {tab.name}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="settings-tab-mobile"
        onClick={() => setDrawerOpen(true)}
      >
        <SlidersHorizontal size={14} />
        {activeMeta.name}
      </button>

      <div
        className={`settings-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        role="presentation"
      />
      <aside className={`settings-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="settings-drawer-head">Settings</div>
        <nav className="settings-drawer-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => selectTab(tab.id)}
              >
                <Icon size={14} />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </aside>

      {activeTab === 'billing' ? (
        <BillingDefaultsTab settings={settings} saveSettings={saveSettings} />
      ) : null}
      {activeTab === 'settlement' ? (
        <SettlementTab settings={settings} saveSettings={saveSettings} />
      ) : null}
      {activeTab === 'manage-admins' ? (
        <ManageAdminsTab showToast={showToast} />
      ) : null}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Plus, Send } from 'lucide-react'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'

const emptyForm = {
  invoiceId: '',
  channel: 'email',
  scheduledFor: '',
  message: '',
}

export default function Reminders({
  reminders,
  invoices,
  schoolMap,
  scheduleReminder,
  markReminderSent,
}) {
  const [channel, setChannel] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const unpaid = invoices.filter((i) => i.status !== 'paid')

  const filtered = useMemo(() => {
    return reminders.filter((r) => channel === 'all' || r.channel === channel)
  }, [reminders, channel])

  function submit() {
    if (!form.invoiceId || !form.scheduledFor || !form.message) return
    scheduleReminder(form)
    setForm(emptyForm)
    setOpen(false)
  }

  return (
    <div className="page-stack">
      <section className="split-cards">
        <div className="info-card">
          <span>Scheduled</span>
          <strong>{reminders.filter((r) => r.status === 'scheduled').length}</strong>
        </div>
        <div className="info-card mint">
          <span>Sent</span>
          <strong>{reminders.filter((r) => r.status === 'sent').length}</strong>
        </div>
        <div className="info-card amber">
          <span>Unpaid invoices</span>
          <strong>{unpaid.length}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Reminder schedule</h2>
            <p>
              Every generated invoice automatically queues friendly reminders 7, 3, and 1 day
              before its due date
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add extra reminder
          </button>
        </div>
        <div className="panel-body">
          <div className="toolbar">
            <div className="filters">
              <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="all">All channels</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>School / Invoice</th>
                  <th>Channel</th>
                  <th>When</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{schoolMap[r.schoolId]?.name}</strong>
                      <div className="muted">{r.invoiceId}</div>
                    </td>
                    <td>
                      <span className={`chip ${r.channel === 'whatsapp' ? 'whatsapp' : ''}`}>
                        {r.channel === 'whatsapp' ? <MessageCircle size={13} /> : <Mail size={13} />}
                        {r.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </span>
                    </td>
                    <td>{r.scheduledFor}</td>
                    <td style={{ maxWidth: 280 }}>
                      {r.message}
                      {r.automatic ? <div className="muted">Automatically scheduled</div> : null}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.status === 'scheduled' ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => markReminderSent(r.id)}
                        >
                          <Send size={14} />
                          Mark sent
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {open ? (
        <Modal
          title="Schedule reminder"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submit}>
                Schedule
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label className="field-label full">
              Invoice
              <select
                className="select"
                value={form.invoiceId}
                onChange={(e) => setForm((f) => ({ ...f, invoiceId: e.target.value }))}
              >
                <option value="">Select unpaid invoice…</option>
                {unpaid.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} — {schoolMap[inv.schoolId]?.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Channel
              <select
                className="select"
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label className="field-label">
              Send on
              <input
                className="field"
                type="date"
                value={form.scheduledFor}
                onChange={(e) => setForm((f) => ({ ...f, scheduledFor: e.target.value }))}
              />
            </label>
            <label className="field-label full">
              Message
              <textarea
                className="textarea"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Write the reminder copy…"
              />
            </label>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

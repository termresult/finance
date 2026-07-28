import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Plus, Send } from 'lucide-react'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime } from '../lib/format'

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
  sendReminderEmail,
}) {
  const [channel, setChannel] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [sendTarget, setSendTarget] = useState(null)
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)

  const unpaid = invoices.filter((i) => i.status !== 'paid')

  const filtered = useMemo(() => {
    return reminders.filter((r) => channel === 'all' || r.channel === channel)
  }, [reminders, channel])

  function openSendModal(reminder) {
    setSendTarget(reminder)
    setSendMessage(reminder.message || '')
  }

  async function submit() {
    if (!form.invoiceId || !form.scheduledFor || !form.message) return
    if (form.channel === 'whatsapp') return
    setBusy(true)
    try {
      await scheduleReminder(form)
      setForm(emptyForm)
      setOpen(false)
    } catch {
      // toast in store
    } finally {
      setBusy(false)
    }
  }

  async function confirmSend() {
    if (!sendTarget || !sendMessage.trim()) return
    setSending(true)
    try {
      await sendReminderEmail(sendTarget.id, sendMessage.trim())
      setSendTarget(null)
      setSendMessage('')
    } catch {
      // toast in store
    } finally {
      setSending(false)
    }
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
              Customize the email copy per school before sending. Last sent time is kept so you do
              not spam contacts.
            </p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add extra reminder
          </button>
        </div>
        <div className="panel-body">
          <div className="toolbar">
            <div className="filters">
              <select
                className="select"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="all">All channels</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <span className="muted">{filtered.length} reminders</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>School / Invoice</th>
                  <th>Channel</th>
                  <th>Scheduled</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Last sent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty">No reminders yet.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{schoolMap[r.schoolId]?.name || r.schoolName}</strong>
                        <div className="muted">{r.invoiceId}</div>
                      </td>
                      <td>
                        <span className={`chip ${r.channel === 'whatsapp' ? 'whatsapp' : ''}`}>
                          {r.channel === 'whatsapp' ? (
                            <MessageCircle size={13} />
                          ) : (
                            <Mail size={13} />
                          )}
                          {r.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                        </span>
                      </td>
                      <td>{r.scheduledFor}</td>
                      <td style={{ maxWidth: 260 }}>
                        <div className="message-preview">{r.message}</div>
                        {r.automatic ? <div className="muted">Auto-scheduled</div> : null}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        {r.sentAt ? (
                          <strong className="last-sent">{formatDateTime(r.sentAt)}</strong>
                        ) : (
                          <span className="muted">Never</span>
                        )}
                      </td>
                      <td>
                        {r.channel === 'email' ? (
                          <div className="row-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              type="button"
                              onClick={() => openSendModal(r)}
                            >
                              <Send size={14} />
                              {r.sentAt ? 'Send again' : 'Send email'}
                            </button>
                            {r.status === 'scheduled' ? (
                              <button
                                className="btn btn-ghost btn-sm"
                                type="button"
                                onClick={() => markReminderSent(r.id)}
                              >
                                Mark sent
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="muted">Coming later</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {filtered.length === 0 ? (
              <div className="empty">No reminders yet.</div>
            ) : (
              filtered.map((r) => (
                <article className="entity-card" key={`m-${r.id}`}>
                  <div className="entity-card-head">
                    <div>
                      <strong>{schoolMap[r.schoolId]?.name || r.schoolName}</strong>
                      <div className="muted">{r.invoiceId}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="entity-card-meta">
                    <div>
                      Channel: <strong>{r.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong>
                    </div>
                    <div>
                      Scheduled: <strong>{r.scheduledFor}</strong>
                    </div>
                    <div>
                      Last sent:{' '}
                      <strong>{r.sentAt ? formatDateTime(r.sentAt) : 'Never'}</strong>
                    </div>
                    <div>{r.message}</div>
                  </div>
                  {r.channel === 'email' ? (
                    <div className="entity-card-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        type="button"
                        onClick={() => openSendModal(r)}
                      >
                        <Send size={14} />
                        {r.sentAt ? 'Send again' : 'Send email'}
                      </button>
                      {r.status === 'scheduled' ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          onClick={() => markReminderSent(r.id)}
                        >
                          Mark sent
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {open ? (
        <Modal
          title="Schedule reminder"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={submit}
                disabled={busy || form.channel === 'whatsapp'}
              >
                {busy ? 'Saving…' : 'Schedule'}
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
                <option value="whatsapp" disabled>
                  WhatsApp (coming later)
                </option>
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

      {sendTarget ? (
        <Modal
          title={sendTarget.sentAt ? 'Send reminder again' : 'Send reminder email'}
          onClose={() => setSendTarget(null)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setSendTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={confirmSend}
                disabled={sending || !sendMessage.trim()}
              >
                <Send size={16} />
                {sending ? 'Sending…' : 'Send now'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="info-card full" style={{ gridColumn: '1 / -1' }}>
              <span>
                {schoolMap[sendTarget.schoolId]?.name || sendTarget.schoolName} ·{' '}
                {sendTarget.invoiceId}
              </span>
              <strong>
                {sendTarget.sentAt
                  ? `Last sent ${formatDateTime(sendTarget.sentAt)}`
                  : 'Not sent yet'}
              </strong>
            </div>
            <label className="field-label full">
              Email message
              <textarea
                className="textarea"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="Customize this message for the school…"
                rows={6}
              />
            </label>
            {sendTarget.sentAt ? (
              <p className="muted full" style={{ gridColumn: '1 / -1', margin: 0 }}>
                This school already received a reminder. Only send again if you need to.
              </p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Eye, Mail, Plus, Printer, Send, Trash2 } from 'lucide-react'
import InvoiceDocument from '../components/InvoiceDocument'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime, formatNaira } from '../lib/format'
import { dueDateFromDays } from '../lib/billing'
import { getLatestInvoiceEmailDelivery } from '../lib/invoiceDeliveries'

const emptyForm = {
  schoolId: '',
  dueAt: dueDateFromDays(14),
  discountPercent: 0,
  notes: '',
}

export default function Invoices({
  invoices,
  schools,
  schoolMap,
  createInvoice,
  deliveries,
  deleteInvoice,
  sendInvoiceEmail,
}) {
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [sendingId, setSendingId] = useState(null)

  const billableSchools = schools.filter(
    (s) => s.billable && Number(s.price) > 0 && s.current_session && s.current_term,
  )

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const school = schoolMap[inv.schoolId]
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        school?.name?.toLowerCase().includes(q) ||
        inv.period?.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || inv.status === status
      return matchesQuery && matchesStatus
    })
  }, [invoices, schoolMap, query, status])

  const selectedSchool = schools.find((s) => String(s.id) === String(form.schoolId))
  const periodLabel =
    selectedSchool?.current_session && selectedSchool?.current_term
      ? `${selectedSchool.current_session.name} · ${selectedSchool.current_term.name}`
      : '—'

  async function handleSend(invoiceId) {
    setSendingId(invoiceId)
    try {
      await sendInvoiceEmail(invoiceId)
    } catch {
      // toast in store
    } finally {
      setSendingId(null)
    }
  }

  async function submit() {
    if (!form.schoolId || !form.dueAt) return
    setBusy(true)
    try {
      const invoice = await createInvoice({
        schoolId: form.schoolId,
        dueAt: form.dueAt,
        discountPercent: form.discountPercent,
        notes: form.notes,
      })
      setForm({ ...emptyForm, dueAt: dueDateFromDays(14) })
      setOpen(false)
      setPreview(invoice)
    } catch {
      // toast handled in store
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Invoice register</h2>
            <p>Create invoices for schools with an unbilled current session/term</p>
          </div>
          <button className="btn btn-primary" onClick={() => setOpen(true)} type="button">
            <Plus size={16} />
            New invoice
          </button>
        </div>
        <div className="panel-body">
          <div className="toolbar">
            <div className="filters">
              <input
                className="field"
                placeholder="Search invoice or school…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <span className="muted">{filtered.length} invoices</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>School</th>
                  <th>Period</th>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Last invoice sent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty">No invoices yet.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => {
                    const latestDelivery = getLatestInvoiceEmailDelivery(deliveries, inv)
                    return (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.id}</strong>
                        </td>
                        <td>
                          <div className="school-cell">
                            <div className="school-mark">{schoolMap[inv.schoolId]?.code}</div>
                            <div>{schoolMap[inv.schoolId]?.name || inv.school?.name}</div>
                          </div>
                        </td>
                        <td>{inv.period}</td>
                        <td>{inv.dueAt}</td>
                        <td>{formatNaira(inv.amount)}</td>
                        <td>
                          <StatusBadge status={inv.status} />
                        </td>
                        <td>
                          {latestDelivery ? (
                            <div>
                              <span className="chip">
                                <Mail size={13} /> Sent
                              </span>
                              <div className="last-sent">
                                {formatDateTime(latestDelivery.sentAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="muted">Never</span>
                          )}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={() => setPreview(inv)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              type="button"
                              disabled={sendingId === inv.id}
                              onClick={() => handleSend(inv.id)}
                            >
                              <Send size={14} />
                              {sendingId === inv.id ? 'Sending…' : 'Send'}
                            </button>
                            {inv.status !== 'paid' ? (
                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                                onClick={() => setDeleteTarget(inv)}
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {filtered.length === 0 ? (
              <div className="empty">No invoices yet.</div>
            ) : (
              filtered.map((inv) => {
                const latestDelivery = getLatestInvoiceEmailDelivery(deliveries, inv)
                return (
                <article className="entity-card" key={`m-${inv.id}`}>
                  <div className="entity-card-head">
                    <div>
                      <strong>{inv.id}</strong>
                      <div className="muted">{schoolMap[inv.schoolId]?.name || inv.school?.name}</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="entity-card-meta">
                    <div>
                      Period: <strong>{inv.period}</strong>
                    </div>
                    <div>
                      Due: <strong>{inv.dueAt}</strong>
                    </div>
                    <div>
                      Amount: <strong>{formatNaira(inv.amount)}</strong>
                    </div>
                    <div>
                      Last invoice sent:{' '}
                      <strong>
                        {latestDelivery ? formatDateTime(latestDelivery.sentAt) : 'Never'}
                      </strong>
                    </div>
                  </div>
                  <div className="entity-card-actions">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPreview(inv)}>
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      disabled={sendingId === inv.id}
                      onClick={() => handleSend(inv.id)}
                    >
                      <Send size={14} />
                      Send
                    </button>
                    {inv.status !== 'paid' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => setDeleteTarget(inv)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
                )
              })
            )}
          </div>
        </div>
      </section>

      {open ? (
        <Modal
          title="Generate invoice"
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
                disabled={busy || !form.schoolId}
              >
                {busy ? 'Creating…' : 'Create invoice'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label className="field-label full">
              School (billable current term only)
              <select
                className="select"
                value={form.schoolId}
                onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
              >
                <option value="">Select school…</option>
                {billableSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.current_session?.name} · {s.current_term?.name} (
                    {s.students} students)
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Billing period
              <input className="field" value={periodLabel} readOnly />
            </label>
            <label className="field-label">
              Due date
              <input
                className="field"
                type="date"
                value={form.dueAt}
                onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              />
            </label>
            <label className="field-label">
              Discount (%)
              <input
                className="field"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              />
            </label>
            <label className="field-label full">
              Notes
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional billing note"
              />
            </label>
          </div>
          {selectedSchool ? (
            <div className="info-card">
              <span>
                {selectedSchool.students.toLocaleString()} active students ×{' '}
                {formatNaira(selectedSchool.price)}
              </span>
              <strong>
                {formatNaira(
                  selectedSchool.students *
                    selectedSchool.price *
                    (1 - Number(form.discountPercent || 0) / 100),
                )}
              </strong>
            </div>
          ) : null}
        </Modal>
      ) : null}

      {preview ? (
        <Modal
          title={`Invoice ${preview.id}`}
          compact
          onClose={() => setPreview(null)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setPreview(null)}>
                Close
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={sendingId === preview.id}
                onClick={() => handleSend(preview.id)}
              >
                <Send size={16} />
                {sendingId === preview.id ? 'Sending…' : 'Send email'}
              </button>
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                <Printer size={16} />
                Print
              </button>
            </>
          }
        >
          <div className="invoice-delivery-banner">
            <strong>Email delivery</strong>
            <span>
              Sends to {schoolMap[preview.schoolId]?.email || 'the school contact email'}. WhatsApp
              comes later.
            </span>
          </div>
          <InvoiceDocument
            compact
            invoice={preview}
            school={schoolMap[preview.schoolId] || preview.school}
          />
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal
          title="Delete invoice"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={async () => {
                  await deleteInvoice(deleteTarget.id)
                  setDeleteTarget(null)
                }}
              >
                <Trash2 size={16} />
                Delete invoice
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--text-soft)', lineHeight: 1.6 }}>
            Delete <strong>{deleteTarget.id}</strong> for{' '}
            <strong>{schoolMap[deleteTarget.schoolId]?.name}</strong>?
          </p>
        </Modal>
      ) : null}
    </div>
  )
}

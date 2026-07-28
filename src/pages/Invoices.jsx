import { useMemo, useState } from 'react'
import { Eye, Mail, MessageCircle, Plus, Printer, Trash2 } from 'lucide-react'
import InvoiceDocument from '../components/InvoiceDocument'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { formatNaira } from '../data/mockData'

const emptyForm = {
  schoolId: '',
  period: '2026 Term 2',
  dueAt: '',
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
}) {
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const school = schoolMap[inv.schoolId]
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        school?.name.toLowerCase().includes(q) ||
        inv.period.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || inv.status === status
      return matchesQuery && matchesStatus
    })
  }, [invoices, schoolMap, query, status])

  const selectedSchool = schools.find((s) => s.id === form.schoolId)

  function submit() {
    if (!form.schoolId || !form.dueAt || !form.period) return
    const invoice = createInvoice(form)
    setForm(emptyForm)
    setOpen(false)
    setPreview(invoice)
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Invoice register</h2>
            <p>Create invoices and track payment status across schools</p>
          </div>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
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
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>School</th>
                  <th>Period</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <strong>{inv.id}</strong>
                      <div className="muted">{inv.notes}</div>
                    </td>
                    <td>
                      <div className="school-cell">
                        <div className="school-mark">{schoolMap[inv.schoolId]?.code}</div>
                        <div>{schoolMap[inv.schoolId]?.name}</div>
                      </div>
                    </td>
                    <td>{inv.period}</td>
                    <td>{inv.issuedAt}</td>
                    <td>{inv.dueAt}</td>
                    <td>{formatNaira(inv.amount)}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>
                      {deliveries.some((item) => item.invoiceId === inv.id) ? (
                        <div className="delivery-badges">
                          <span title="Sent by email">
                            <Mail size={14} /> Sent
                          </span>
                          <span className="whatsapp" title="Sent by WhatsApp">
                            <MessageCircle size={14} /> Sent
                          </span>
                        </div>
                      ) : (
                        <span className="muted">Previous record</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setPreview(inv)}>
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(inv)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
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
          title="Generate invoice"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submit}>
                Create invoice
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label className="field-label full">
              School
              <select
                className="select"
                value={form.schoolId}
                onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
              >
                <option value="">Select school…</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Billing period
              <input
                className="field"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              />
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountPercent: e.target.value }))
                }
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
                {selectedSchool.students.toLocaleString()} students ×{' '}
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
          wide
          onClose={() => setPreview(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setPreview(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                Print / Save PDF
              </button>
            </>
          }
        >
          {deliveries.some((item) => item.invoiceId === preview.id) ? (
            <div className="invoice-delivery-banner">
              <strong>Invoice delivered instantly</strong>
              <span>
                Email: {schoolMap[preview.schoolId]?.email} · WhatsApp:{' '}
                {schoolMap[preview.schoolId]?.phone}
              </span>
            </div>
          ) : null}
          <InvoiceDocument invoice={preview} school={schoolMap[preview.schoolId]} />
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal
          title="Delete invoice"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteInvoice(deleteTarget.id)
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
            <strong>{schoolMap[deleteTarget.schoolId]?.name}</strong>? Its scheduled reminders
            and delivery records will also be removed.
          </p>
        </Modal>
      ) : null}
    </div>
  )
}

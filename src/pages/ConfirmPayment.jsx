import { useMemo, useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { formatNaira } from '../lib/format'

const emptyForm = {
  invoiceId: '',
  reference: '',
  paidAt: new Date().toISOString().slice(0, 10),
  note: 'Confirmed via bank transfer',
}

export default function ConfirmPayment({ invoices, schoolMap, confirmPayment }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const unpaid = useMemo(
    () => invoices.filter((i) => i.status === 'pending' || i.status === 'overdue'),
    [invoices],
  )

  const selected = unpaid.find((i) => i.id === form.invoiceId)

  function openFor(invoiceId) {
    setForm((f) => ({ ...f, invoiceId }))
    setOpen(true)
  }

  async function submit() {
    if (!form.invoiceId) return
    setBusy(true)
    try {
      await confirmPayment(form)
      setForm(emptyForm)
      setOpen(false)
    } catch {
      // toast in store
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="split-cards">
        <div className="info-card amber">
          <span>Awaiting confirmation</span>
          <strong>{unpaid.length}</strong>
        </div>
        <div className="info-card">
          <span>Pending amount</span>
          <strong>
            {formatNaira(
              unpaid.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
            )}
          </strong>
        </div>
        <div className="info-card" style={{ background: 'var(--rose-soft)', borderColor: '#ffd0d9' }}>
          <span>Overdue amount</span>
          <strong>
            {formatNaira(
              unpaid.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
            )}
          </strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Manual payment confirmation</h2>
            <p>
              Use this when schools pay by bank transfer — verify the reference, then mark the invoice
              paid.
            </p>
          </div>
        </div>
        <div className="panel-body">
          {unpaid.length === 0 ? (
            <div className="empty">All invoices are paid. Nice work.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>School</th>
                      <th>Amount</th>
                      <th>Due</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {unpaid.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.id}</strong>
                          <div className="muted">{inv.period}</div>
                        </td>
                        <td>
                          <div className="school-cell">
                            <div className="school-mark">{schoolMap[inv.schoolId]?.code}</div>
                            <div>
                              <div>{schoolMap[inv.schoolId]?.name}</div>
                              <div className="muted">{schoolMap[inv.schoolId]?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatNaira(inv.amount)}</td>
                        <td>{inv.dueAt}</td>
                        <td>
                          <StatusBadge status={inv.status} />
                        </td>
                        <td>
                          <button className="btn btn-success btn-sm" onClick={() => openFor(inv.id)}>
                            <BadgeCheck size={14} />
                            Confirm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-card-list">
                {unpaid.map((inv) => (
                  <article className="entity-card" key={`m-${inv.id}`}>
                    <div className="entity-card-head">
                      <div>
                        <strong>{inv.id}</strong>
                        <div className="muted">{schoolMap[inv.schoolId]?.name}</div>
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="entity-card-meta">
                      <div>
                        Amount: <strong>{formatNaira(inv.amount)}</strong>
                      </div>
                      <div>
                        Due: <strong>{inv.dueAt}</strong>
                      </div>
                      <div>
                        Period: <strong>{inv.period}</strong>
                      </div>
                    </div>
                    <div className="entity-card-actions">
                      <button className="btn btn-success btn-sm" onClick={() => openFor(inv.id)}>
                        <BadgeCheck size={14} />
                        Confirm
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {open ? (
        <Modal
          title="Confirm payment"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={busy}>
                {busy ? 'Saving…' : 'Mark as paid'}
              </button>
            </>
          }
        >
          {selected ? (
            <div className="info-card mint">
              <span>
                {selected.id} · {schoolMap[selected.schoolId]?.name}
              </span>
              <strong>{formatNaira(selected.amount)}</strong>
            </div>
          ) : null}
          <div className="form-grid">
            <label className="field-label full">
              Bank / transfer reference (optional)
              <input
                className="field"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="e.g. TRF-991204"
              />
            </label>
            <label className="field-label">
              Payment date
              <input
                className="field"
                type="date"
                value={form.paidAt}
                onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))}
              />
            </label>
            <label className="field-label">
              Invoice
              <select
                className="select"
                value={form.invoiceId}
                onChange={(e) => setForm((f) => ({ ...f, invoiceId: e.target.value }))}
              >
                {unpaid.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label full">
              Admin note
              <textarea
                className="textarea"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </label>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

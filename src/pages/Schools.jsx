import { useMemo, useState } from 'react'
import { History, Mail, Phone } from 'lucide-react'
import Drawer from '../components/Drawer'
import StatusBadge from '../components/StatusBadge'
import { formatNaira } from '../lib/format'

export default function Schools({ schools, invoices, updateSchoolPrice }) {
  const [query, setQuery] = useState('')
  const [plan, setPlan] = useState('all')
  const [filter, setFilter] = useState('all')
  const [historySchool, setHistorySchool] = useState(null)

  const rows = useMemo(() => {
    return schools
      .filter((s) => {
        const q = query.toLowerCase()
        const matchesQuery =
          !q ||
          s.name?.toLowerCase().includes(q) ||
          (s.city || '').toLowerCase().includes(q) ||
          (s.contact || '').toLowerCase().includes(q)
        const matchesPlan = plan === 'all' || s.plan === plan
        const matchesBillable =
          filter === 'all' ||
          (filter === 'billable' && s.billable) ||
          (filter === 'billed' && s.has_invoice_for_current_term)
        return matchesQuery && matchesPlan && matchesBillable
      })
      .map((school) => {
        const schoolInvoices = invoices
          .filter((i) => i.schoolId === school.id)
          .slice()
          .sort((a, b) => String(b.issuedAt || '').localeCompare(String(a.issuedAt || '')))
        const outstanding = schoolInvoices
          .filter((i) => i.status !== 'paid')
          .reduce((sum, i) => sum + i.amount, 0)
        const paidCount = schoolInvoices.filter((i) => i.status === 'paid').length
        return {
          school,
          outstanding,
          invoiceCount: schoolInvoices.length,
          paidCount,
          history: schoolInvoices,
        }
      })
  }, [schools, invoices, query, plan, filter])

  const historyRows = historySchool
    ? invoices
        .filter((i) => i.schoolId === historySchool.id)
        .slice()
        .sort((a, b) => String(b.issuedAt || '').localeCompare(String(a.issuedAt || '')))
    : []

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Active TermResult schools</h2>
            <p>
              Set price per student, see who is billable this term, and open billing history per
              school.
            </p>
          </div>
        </div>
        <div className="panel-body">
          <div className="toolbar">
            <div className="filters">
              <input
                className="field"
                placeholder="Filter by school, city, contact…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select className="select" value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="all">All plans</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
              <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All billing states</option>
                <option value="billable">Billable now</option>
                <option value="billed">Current term billed</option>
              </select>
            </div>
            <span className="muted">{rows.length} schools</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Current period</th>
                  <th>Students</th>
                  <th>Price / student</th>
                  <th>Invoices</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty">No active schools found.</div>
                    </td>
                  </tr>
                ) : (
                  rows.map(({ school, outstanding, invoiceCount, paidCount }) => (
                    <tr key={school.id}>
                      <td>
                        <div className="school-cell">
                          <div className="school-mark">{school.code}</div>
                          <div>
                            <div>{school.name}</div>
                            <div className="muted">
                              {school.email || school.phone || school.subdomain}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {school.current_session && school.current_term ? (
                          <div>
                            {school.current_session.name} · {school.current_term.name}
                          </div>
                        ) : (
                          <span className="muted">No current term</span>
                        )}
                      </td>
                      <td>{school.students.toLocaleString()}</td>
                      <td>
                        <div className="price-input">
                          <span>₦</span>
                          <input
                            type="number"
                            min="0"
                            defaultValue={school.price}
                            key={`${school.id}-${school.price}`}
                            aria-label={`Price per student for ${school.name}`}
                            onBlur={(event) => updateSchoolPrice(school.id, event.target.value)}
                          />
                        </div>
                      </td>
                      <td>
                        <strong>{invoiceCount}</strong>
                        <div className="muted">{paidCount} paid</div>
                      </td>
                      <td>{outstanding ? formatNaira(outstanding) : '—'}</td>
                      <td>
                        {school.billable ? (
                          <span className="chip">Billable</span>
                        ) : school.has_invoice_for_current_term ? (
                          <span className="muted">Billed</span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          onClick={() => setHistorySchool(school)}
                        >
                          <History size={14} />
                          History
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {rows.length === 0 ? (
              <div className="empty">No active schools found.</div>
            ) : (
              rows.map(({ school, outstanding, invoiceCount }) => (
                <article className="entity-card" key={`m-${school.id}`}>
                  <div className="entity-card-head">
                    <div className="school-cell">
                      <div className="school-mark">{school.code}</div>
                      <div>
                        <div>{school.name}</div>
                        <div className="muted">{school.city || school.subdomain}</div>
                      </div>
                    </div>
                    {school.billable ? (
                      <span className="chip">Billable</span>
                    ) : (
                      <span className="muted">Billed</span>
                    )}
                  </div>
                  <div className="entity-card-meta">
                    <div>
                      Period:{' '}
                      <strong>
                        {school.current_session && school.current_term
                          ? `${school.current_session.name} · ${school.current_term.name}`
                          : 'Not set'}
                      </strong>
                    </div>
                    <div>
                      Students: <strong>{school.students.toLocaleString()}</strong>
                    </div>
                    <div>
                      Invoices: <strong>{invoiceCount}</strong>
                    </div>
                    <div>
                      Outstanding:{' '}
                      <strong>{outstanding ? formatNaira(outstanding) : '—'}</strong>
                    </div>
                  </div>
                  <div className="entity-card-actions">
                    <div className="price-input" style={{ flex: 1 }}>
                      <span>₦</span>
                      <input
                        type="number"
                        min="0"
                        defaultValue={school.price}
                        key={`m-${school.id}-${school.price}`}
                        onBlur={(event) => updateSchoolPrice(school.id, event.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => setHistorySchool(school)}
                    >
                      <History size={14} />
                      History
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {historySchool ? (
        <Drawer
          title={historySchool.name}
          subtitle={`Billing history · ${historyRows.length} invoice(s)`}
          onClose={() => setHistorySchool(null)}
        >
          <div className="entity-card-meta" style={{ marginBottom: 4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} /> {historySchool.email || '—'}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} /> {historySchool.phone || '—'}
            </div>
            <div>
              Price / student: <strong>{formatNaira(historySchool.price)}</strong>
            </div>
          </div>

          {historyRows.length === 0 ? (
            <div className="empty">No invoices for this school yet.</div>
          ) : (
            historyRows.map((inv) => (
              <article className="history-item" key={inv.id}>
                <div className="history-item-head">
                  <strong>{inv.id}</strong>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="history-item-meta">
                  <div>
                    Period: <strong>{inv.period}</strong>
                  </div>
                  <div>
                    Issued: <strong>{inv.issuedAt}</strong> · Due: <strong>{inv.dueAt}</strong>
                  </div>
                  <div>
                    Amount: <strong>{formatNaira(inv.amount)}</strong>
                    {inv.paidAt ? (
                      <>
                        {' '}
                        · Paid: <strong>{inv.paidAt}</strong>
                      </>
                    ) : null}
                  </div>
                  {inv.reference ? (
                    <div>
                      Ref: <strong>{inv.reference}</strong>
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </Drawer>
      ) : null}
    </div>
  )
}

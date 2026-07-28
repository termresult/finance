import { useMemo, useState } from 'react'
import { Mail, Phone } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { formatNaira } from '../data/mockData'

export default function Schools({ schools, invoices, updateSchoolPrice }) {
  const [query, setQuery] = useState('')
  const [plan, setPlan] = useState('all')

  const rows = useMemo(() => {
    return schools
      .filter((s) => {
        const q = query.toLowerCase()
        const matchesQuery =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.contact.toLowerCase().includes(q)
        const matchesPlan = plan === 'all' || s.plan === plan
        return matchesQuery && matchesPlan
      })
      .map((school) => {
        const schoolInvoices = invoices.filter((i) => i.schoolId === school.id)
        const outstanding = schoolInvoices
          .filter((i) => i.status !== 'paid')
          .reduce((sum, i) => sum + i.amount, 0)
        return { school, outstanding, invoiceCount: schoolInvoices.length }
      })
  }, [schools, invoices, query, plan])

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Subscribed schools</h2>
            <p>Set each school’s price per student before generating its invoice</p>
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
            </div>
            <span className="muted">{rows.length} schools</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>School</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Students</th>
                  <th>Price / student</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ school, outstanding }) => (
                  <tr key={school.id}>
                    <td>
                      <div className="school-cell">
                        <div className="school-mark">{school.code}</div>
                        <div>
                          <div>{school.name}</div>
                          <div className="muted">{school.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{school.contact}</div>
                      <div className="muted" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={12} /> {school.email}
                        </span>
                      </div>
                      <div className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Phone size={12} /> {school.phone}
                      </div>
                    </td>
                    <td>{school.plan}</td>
                    <td>{school.students.toLocaleString()}</td>
                    <td>
                      <div className="price-input">
                        <span>₦</span>
                        <input
                          type="number"
                          min="0"
                          defaultValue={school.price}
                          aria-label={`Price per student for ${school.name}`}
                          onBlur={(event) =>
                            updateSchoolPrice(school.id, event.target.value)
                          }
                        />
                      </div>
                      <div className="muted">
                        {formatNaira(school.price * school.students)} before discount
                      </div>
                    </td>
                    <td>{outstanding ? formatNaira(outstanding) : '—'}</td>
                    <td>
                      <StatusBadge status={school.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

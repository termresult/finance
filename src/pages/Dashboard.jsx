import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  Banknote,
  Building2,
  Clock3,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { formatNaira, revenueSeries } from '../data/mockData'

export default function Dashboard({ stats, invoices, schools, schoolMap, reminders }) {
  const recent = [...invoices].slice(0, 5)
  const latestReminders = [...reminders].slice(0, 4)

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard
          label="Collected"
          value={formatNaira(stats.collected)}
          meta="Confirmed payments this cycle"
          metaTone="up"
          tone="green"
          icon={<Banknote size={18} />}
        />
        <StatCard
          label="Outstanding"
          value={formatNaira(stats.outstanding)}
          meta={`${stats.pendingCount} pending · ${stats.overdueCount} overdue`}
          metaTone={stats.overdueCount ? 'down' : ''}
          tone="amber"
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Active Schools"
          value={stats.schoolsActive}
          meta={`${schools.length} total subscriptions`}
          tone="blue"
          icon={<Building2 size={18} />}
        />
        <StatCard
          label="Overdue Invoices"
          value={stats.overdueCount}
          meta={`${stats.remindersDue} reminders queued`}
          metaTone={stats.overdueCount ? 'down' : 'up'}
          tone="rose"
          icon={<AlertTriangle size={18} />}
        />
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Collections trend</h2>
              <p>Monthly collected vs outstanding balances</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f7cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2f7cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outstanding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                  <XAxis dataKey="month" tick={{ fill: '#8a93a6', fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    tick={{ fill: '#8a93a6', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatNaira(value)}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e4e9f2',
                      boxShadow: '0 10px 30px rgba(15,28,61,0.08)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    name="Collected"
                    stroke="#2f7cf6"
                    fill="url(#collected)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="outstanding"
                    name="Outstanding"
                    stroke="#d97706"
                    fill="url(#outstanding)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Reminder activity</h2>
              <p>Latest email & WhatsApp outreach</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="timeline">
              {latestReminders.map((r) => (
                <div className="timeline-item" key={r.id}>
                  <div className="timeline-dot" />
                  <div>
                    <h4>
                      {schoolMap[r.schoolId]?.name} · {r.invoiceId}
                    </h4>
                    <p>
                      {r.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} · {r.scheduledFor} ·{' '}
                      {r.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Recent invoices</h2>
            <p>Latest billing activity across subscribed schools</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>School</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <strong>{inv.id}</strong>
                  </td>
                  <td>
                    <div className="school-cell">
                      <div className="school-mark">{schoolMap[inv.schoolId]?.code}</div>
                      <div>
                        <div>{schoolMap[inv.schoolId]?.name}</div>
                        <div className="muted">{schoolMap[inv.schoolId]?.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>{inv.period}</td>
                  <td>{formatNaira(inv.amount)}</td>
                  <td>{inv.dueAt}</td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

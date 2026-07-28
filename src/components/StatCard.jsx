export default function StatCard({ label, value, meta, metaTone = '', icon, tone = 'blue' }) {
  const tones = {
    blue: { bg: 'var(--sky)', color: 'var(--blue-deep)' },
    green: { bg: 'var(--mint)', color: 'var(--success)' },
    amber: { bg: 'var(--amber-soft)', color: 'var(--warning)' },
    rose: { bg: 'var(--rose-soft)', color: 'var(--danger)' },
  }
  const t = tones[tone] || tones.blue

  return (
    <article className="stat-card">
      <div className="label">
        <span>{label}</span>
        <span className="icon-wrap" style={{ background: t.bg, color: t.color }}>
          {icon}
        </span>
      </div>
      <p className="value">{value}</p>
      {meta ? <div className={`meta ${metaTone}`}>{meta}</div> : null}
    </article>
  )
}

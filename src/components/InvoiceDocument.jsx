import { formatNaira } from '../lib/format'

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export default function InvoiceDocument({ invoice, school, settings = null, compact = false }) {
  const quantity = invoice.quantity || school?.students || 1
  const rate = invoice.rate || Math.round((invoice.amount || 0) / quantity)
  const subtotal = invoice.subtotal || invoice.amount
  const discountAmount = invoice.discountAmount || 0
  const schoolName = school?.name || invoice.school?.name || 'School'
  const orgName = settings?.organization_name || 'TermResult Nexus Limited'
  const hasSettlement =
    Boolean(settings?.bank_name) ||
    Boolean(settings?.bank_account_name) ||
    Boolean(settings?.bank_account_number)

  return (
    <article className={`invoice-document ${compact ? 'compact' : ''}`} id="printable-invoice">
      <header className="invoice-document-header">
        <img src="/brand/termresult-logo.jpeg" alt="TermResult" />
        <div className="invoice-title">
          <h1>INVOICE</h1>
          <span># {invoice.id}</span>
        </div>
      </header>

      <section className="invoice-parties">
        <div>
          <strong>{String(orgName).toUpperCase()}</strong>
          <span>Bill To:</span>
          <b>{String(schoolName).toUpperCase()}</b>
        </div>
        <dl>
          <div>
            <dt>Date:</dt>
            <dd>{formatDate(invoice.issuedAt)}</dd>
          </div>
          <div>
            <dt>Due Date:</dt>
            <dd>{formatDate(invoice.dueAt)}</dd>
          </div>
          <div>
            <dt>Period:</dt>
            <dd>{invoice.period}</dd>
          </div>
          <div className="balance-row">
            <dt>Balance Due:</dt>
            <dd>{formatNaira(invoice.amount)}</dd>
          </div>
        </dl>
      </section>

      <table className="invoice-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{(invoice.item || invoice.period || '').toUpperCase()}</td>
            <td>{quantity.toLocaleString()}</td>
            <td>{formatNaira(rate)}</td>
            <td>{formatNaira(subtotal)}</td>
          </tr>
        </tbody>
      </table>

      <section className="invoice-totals">
        <dl>
          <div>
            <dt>Subtotal:</dt>
            <dd>{formatNaira(subtotal)}</dd>
          </div>
          <div>
            <dt>Discount ({invoice.discountPercent || 0}%):</dt>
            <dd>{formatNaira(discountAmount)}</dd>
          </div>
          <div className="invoice-total">
            <dt>Total:</dt>
            <dd>{formatNaira(invoice.amount)}</dd>
          </div>
        </dl>
      </section>

      {hasSettlement ? (
        <section className="invoice-settlement">
          <span>Settlement account</span>
          {settings.bank_name ? <p>Bank: {settings.bank_name}</p> : null}
          {settings.bank_account_name ? <p>Account name: {settings.bank_account_name}</p> : null}
          {settings.bank_account_number ? (
            <p>Account number: {settings.bank_account_number}</p>
          ) : null}
          <p>Use invoice number {invoice.id} as your payment reference.</p>
        </section>
      ) : null}

      <footer className="invoice-notes">
        <span>Notes:</span>
        <p>{invoice.notes || '—'}</p>
        <span>Terms:</span>
        <p>{invoice.terms || 'Payment is due on or before the date shown above.'}</p>
        {settings?.support_email ? (
          <>
            <span>Support:</span>
            <p>{settings.support_email}</p>
          </>
        ) : null}
      </footer>
    </article>
  )
}

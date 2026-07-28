import { describe, expect, it } from 'vitest'
import { getLatestInvoiceEmailDelivery } from './invoiceDeliveries'

describe('getLatestInvoiceEmailDelivery', () => {
  it('returns the most recent sent email for an invoice', () => {
    const deliveries = [
      {
        invoiceId: 'INV-2026-001',
        channel: 'email',
        status: 'sent',
        sentAt: '2026-07-28T15:10:00+01:00',
      },
      {
        invoiceId: 'INV-2026-001',
        channel: 'email',
        status: 'failed',
        sentAt: null,
      },
      {
        invoiceId: 'INV-2026-001',
        channel: 'email',
        status: 'sent',
        sentAt: '2026-07-28T16:20:00+01:00',
      },
      {
        invoiceId: 'INV-2026-002',
        channel: 'email',
        status: 'sent',
        sentAt: '2026-07-28T17:00:00+01:00',
      },
    ]

    expect(getLatestInvoiceEmailDelivery(deliveries, { id: 'INV-2026-001', db_id: 1 })).toEqual(
      deliveries[2],
    )
  })

  it('returns null when the invoice has no accepted email', () => {
    const deliveries = [
      {
        invoiceId: 1,
        channel: 'email',
        status: 'failed',
        sentAt: null,
      },
    ]

    expect(getLatestInvoiceEmailDelivery(deliveries, { id: 'INV-2026-001', db_id: 1 })).toBeNull()
  })
})

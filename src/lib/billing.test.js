import { describe, expect, it } from 'vitest'
import {
  buildInvoice,
  buildInvoiceDeliveries,
  buildReminderSchedule,
  confirmInvoicePayment,
  deleteInvoiceRecords,
  validateTemporaryPassword,
} from './billing'

describe('temporary admin authentication', () => {
  it('accepts only the configured temporary password', () => {
    expect(validateTemporaryPassword('Godisgreat@123')).toBe(true)
    expect(validateTemporaryPassword('wrong-password')).toBe(false)
  })
})

describe('payment confirmation', () => {
  it('confirms payment even when an optional bank reference is not supplied', () => {
    const invoices = [{ id: 'INV-1', status: 'pending', notes: 'Term billing' }]
    const result = confirmInvoicePayment(invoices, {
      invoiceId: 'INV-1',
      reference: '',
      paidAt: '2026-07-28',
      note: 'Confirmed manually',
    })

    expect(result[0]).toEqual(
      expect.objectContaining({
        status: 'paid',
        paidAt: '2026-07-28',
        reference: 'MANUAL-INV-1',
      }),
    )
  })
})

describe('invoice deletion', () => {
  it('removes the invoice and its reminder and delivery records', () => {
    const result = deleteInvoiceRecords('INV-1', {
      invoices: [{ id: 'INV-1' }, { id: 'INV-2' }],
      reminders: [{ id: 'REM-1', invoiceId: 'INV-1' }],
      deliveries: [{ id: 'DEL-1', invoiceId: 'INV-1' }],
    })

    expect(result.invoices).toEqual([{ id: 'INV-2' }])
    expect(result.reminders).toEqual([])
    expect(result.deliveries).toEqual([])
  })
})

describe('instant invoice delivery', () => {
  it('records the generated invoice as sent by email and WhatsApp', () => {
    const deliveries = buildInvoiceDeliveries({
      invoiceId: 'INV-2026-020',
      school: {
        id: 'sch-001',
        email: 'accounts@school.test',
        phone: '+2348000000000',
      },
      sentAt: '2026-07-28T05:55:00.000Z',
    })

    expect(deliveries).toEqual([
      expect.objectContaining({
        channel: 'email',
        recipient: 'accounts@school.test',
        status: 'sent',
      }),
      expect.objectContaining({
        channel: 'whatsapp',
        recipient: '+2348000000000',
        status: 'sent',
      }),
    ])
  })
})

describe('invoice generation', () => {
  it('uses the selected school price and applies its discount', () => {
    const invoice = buildInvoice({
      id: 'INV-2026-020',
      school: {
        id: 'sch-001',
        name: 'Christ Leads Group of Schools',
        price: 3000,
        students: 294,
      },
      period: 'Third Term Subscription',
      issuedAt: '2026-07-13',
      dueAt: '2026-07-30',
      discountPercent: 33.3,
    })

    expect(invoice.quantity).toBe(294)
    expect(invoice.rate).toBe(3000)
    expect(invoice.subtotal).toBe(882000)
    expect(invoice.discountAmount).toBe(293706)
    expect(invoice.amount).toBe(588294)
  })
})

describe('automatic reminders', () => {
  it('schedules casual email and WhatsApp reminders before the due date', () => {
    const reminders = buildReminderSchedule({
      invoiceId: 'INV-2026-020',
      schoolId: 'sch-001',
      schoolName: 'Christ Leads Group of Schools',
      dueAt: '2026-07-30',
    })

    expect(reminders).toHaveLength(3)
    expect(reminders.map((item) => item.scheduledFor)).toEqual([
      '2026-07-23',
      '2026-07-27',
      '2026-07-29',
    ])
    expect(reminders.every((item) => item.status === 'scheduled')).toBe(true)
    expect(reminders.some((item) => item.channel === 'whatsapp')).toBe(true)
    expect(reminders.some((item) => item.channel === 'email')).toBe(true)
  })
})

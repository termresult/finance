import { describe, expect, it } from 'vitest'
import { buildInvoicePdfFilename, slugPart } from './invoicePdf'

describe('buildInvoicePdfFilename', () => {
  it('builds school_session_term filename', () => {
    expect(
      buildInvoicePdfFilename({
        school: { name: 'Term Academy' },
        invoice: {
          id: 'INV-2026-001',
          session_name: '2025/2026',
          term_name: 'First Term',
        },
      }),
    ).toBe('term-academy_2025-2026_first-term.pdf')
  })

  it('falls back to period parts', () => {
    expect(
      buildInvoicePdfFilename({
        school: { name: 'Food Academy' },
        invoice: {
          id: 'INV-2026-002',
          period: '2025/2026 · Second Term',
        },
      }),
    ).toBe('food-academy_2025-2026_second-term.pdf')
  })
})

describe('slugPart', () => {
  it('normalizes unsafe characters', () => {
    expect(slugPart('  St. Mary & Sons  ')).toBe('st-mary-sons')
  })
})

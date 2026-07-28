import { describe, expect, it } from 'vitest'
import { dueDateFromDays } from './billing'
import { formatNaira } from './format'

describe('dueDateFromDays', () => {
  it('returns an ISO date string', () => {
    expect(dueDateFromDays(14)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formatNaira', () => {
  it('formats Nigerian naira amounts', () => {
    expect(formatNaira(1500)).toContain('1,500')
  })
})

export function slugPart(value) {
  return String(value || '')
    .trim()
    .replace(/[\/\\]+/g, '-')
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * Filename: {school}_{session}_{term}.pdf
 * Falls back to invoice period / invoice id when session/term missing.
 */
export function buildInvoicePdfFilename({ school, invoice }) {
  const schoolName = school?.name || invoice?.school?.name || 'school'
  const session =
    invoice?.session_name ||
    school?.current_session?.name ||
    invoice?.period?.split('·')?.[0] ||
    'session'
  const term =
    invoice?.term_name ||
    school?.current_term?.name ||
    invoice?.period?.split('·')?.[1] ||
    'term'

  const parts = [slugPart(schoolName), slugPart(session), slugPart(term)].filter(Boolean)
  return `${parts.join('_') || slugPart(invoice?.id) || 'invoice'}.pdf`
}

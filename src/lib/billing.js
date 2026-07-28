const TEMPORARY_PASSWORD = 'Godisgreat@123'

function subtractDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export function validateTemporaryPassword(password) {
  return password === TEMPORARY_PASSWORD
}

export function buildInvoice({
  id,
  school,
  period,
  issuedAt,
  dueAt,
  discountPercent = 0,
  notes = '',
}) {
  const quantity = Number(school.students) || 1
  const rate = Number(school.price) || 0
  const subtotal = quantity * rate
  const discountAmount = Math.round(subtotal * (Number(discountPercent) / 100))

  return {
    id,
    schoolId: school.id,
    item: period,
    period,
    quantity,
    rate,
    subtotal,
    discountPercent: Number(discountPercent),
    discountAmount,
    taxAmount: 0,
    amount: subtotal - discountAmount,
    issuedAt,
    dueAt,
    status: 'pending',
    notes:
      notes ||
      'This invoice covers the TERMRESULT platform subscription, including access to the complete school management system.',
    terms: discountAmount
      ? `Discount applied. A discount of ${discountPercent}% has been applied.`
      : 'Payment is due on or before the date shown above.',
  }
}

export function buildReminderSchedule({
  invoiceId,
  schoolId,
  schoolName,
  dueAt,
}) {
  const schedule = [
    { daysBefore: 7, channel: 'email' },
    { daysBefore: 3, channel: 'whatsapp' },
    { daysBefore: 1, channel: 'email' },
  ]

  return schedule.map(({ daysBefore, channel }) => ({
    id: `rem-${invoiceId}-${daysBefore}`,
    invoiceId,
    schoolId,
    channel,
    scheduledFor: subtractDays(dueAt, daysBefore),
    status: 'scheduled',
    automatic: true,
    message: `Hi ${schoolName}, this is a friendly reminder that invoice ${invoiceId} is due on ${dueAt}. Thank you.`,
  }))
}

export function buildInvoiceDeliveries({ invoiceId, school, sentAt = new Date().toISOString() }) {
  return [
    {
      id: `delivery-${invoiceId}-email`,
      invoiceId,
      channel: 'email',
      recipient: school.email,
      status: 'sent',
      sentAt,
    },
    {
      id: `delivery-${invoiceId}-whatsapp`,
      invoiceId,
      channel: 'whatsapp',
      recipient: school.phone,
      status: 'sent',
      sentAt,
    },
  ]
}

export function confirmInvoicePayment(
  invoices,
  { invoiceId, reference, paidAt, note },
) {
  return invoices.map((invoice) =>
    invoice.id === invoiceId
      ? {
          ...invoice,
          status: 'paid',
          paidAt,
          reference: reference?.trim() || `MANUAL-${invoiceId}`,
          notes: note ? `${invoice.notes} · ${note}` : invoice.notes,
        }
      : invoice,
  )
}

export function deleteInvoiceRecords(
  invoiceId,
  { invoices, reminders, deliveries },
) {
  return {
    invoices: invoices.filter((invoice) => invoice.id !== invoiceId),
    reminders: reminders.filter((reminder) => reminder.invoiceId !== invoiceId),
    deliveries: deliveries.filter((delivery) => delivery.invoiceId !== invoiceId),
  }
}

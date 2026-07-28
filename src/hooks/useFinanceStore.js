import { useCallback, useMemo, useState } from 'react'
import {
  initialInvoices,
  initialReminders,
  initialSchools,
  nextInvoiceId,
} from '../data/mockData'
import {
  buildInvoice,
  buildInvoiceDeliveries,
  buildReminderSchedule,
  confirmInvoicePayment,
  deleteInvoiceRecords,
} from '../lib/billing'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function useFinanceStore() {
  const [schools, setSchools] = useState(initialSchools)
  const [invoices, setInvoices] = useState(initialInvoices)
  const [reminders, setReminders] = useState(initialReminders)
  const [deliveries, setDeliveries] = useState([])
  const [toast, setToast] = useState(null)

  const schoolMap = useMemo(
    () => Object.fromEntries(schools.map((s) => [s.id, s])),
    [schools],
  )

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const createInvoice = useCallback(
    ({ schoolId, period, notes, dueAt, discountPercent = 0 }) => {
      const school = schoolMap[schoolId]
      if (!school) return

      const invoice = buildInvoice({
        id: nextInvoiceId(invoices),
        school,
        period,
        issuedAt: todayIso(),
        dueAt,
        notes,
        discountPercent,
      })
      const automaticReminders = buildReminderSchedule({
        invoiceId: invoice.id,
        schoolId,
        schoolName: school.name,
        dueAt,
      })
      const invoiceDeliveries = buildInvoiceDeliveries({
        invoiceId: invoice.id,
        school,
      })

      setInvoices((prev) => [invoice, ...prev])
      setReminders((prev) => [...automaticReminders, ...prev])
      setDeliveries((prev) => [...invoiceDeliveries, ...prev])
      showToast(`Invoice ${invoice.id} sent by Email & WhatsApp`)
      return invoice
    },
    [invoices, schoolMap, showToast],
  )

  const updateSchoolPrice = useCallback(
    (schoolId, price) => {
      const numericPrice = Math.max(0, Number(price) || 0)
      setSchools((prev) =>
        prev.map((school) =>
          school.id === schoolId ? { ...school, price: numericPrice } : school,
        ),
      )
      showToast('School subscription price updated')
    },
    [showToast],
  )

  const confirmPayment = useCallback(
    ({ invoiceId, reference, paidAt, note }) => {
      setInvoices((prev) =>
        confirmInvoicePayment(prev, {
          invoiceId,
          reference,
          paidAt: paidAt || todayIso(),
          note,
        }),
      )
      showToast(`Payment confirmed for ${invoiceId}`)
    },
    [showToast],
  )

  const deleteInvoice = useCallback(
    (invoiceId) => {
      const records = deleteInvoiceRecords(invoiceId, {
        invoices,
        reminders,
        deliveries,
      })
      setInvoices(records.invoices)
      setReminders(records.reminders)
      setDeliveries(records.deliveries)
      showToast(`Invoice ${invoiceId} deleted`)
    },
    [deliveries, invoices, reminders, showToast],
  )

  const scheduleReminder = useCallback(
    ({ invoiceId, channel, scheduledFor, message }) => {
      const invoice = invoices.find((i) => i.id === invoiceId)
      if (!invoice) return

      const reminder = {
        id: `rem-${Date.now()}`,
        invoiceId,
        schoolId: invoice.schoolId,
        channel,
        scheduledFor,
        status: 'scheduled',
        message,
      }

      setReminders((prev) => [reminder, ...prev])
      showToast(`${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} reminder scheduled`)
      return reminder
    },
    [invoices, showToast],
  )

  const markReminderSent = useCallback(
    (reminderId) => {
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, status: 'sent' } : r)),
      )
      showToast('Reminder marked as sent')
    },
    [showToast],
  )

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid')
    const pending = invoices.filter((i) => i.status === 'pending')
    const overdue = invoices.filter((i) => i.status === 'overdue')
    const collected = paid.reduce((sum, i) => sum + i.amount, 0)
    const outstanding = [...pending, ...overdue].reduce((sum, i) => sum + i.amount, 0)

    return {
      collected,
      outstanding,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      schoolsActive: schools.filter((s) => s.status === 'active').length,
      remindersDue: reminders.filter((r) => r.status === 'scheduled').length,
    }
  }, [invoices, reminders, schools])

  return {
    schools,
    schoolMap,
    invoices,
    reminders,
    deliveries,
    stats,
    toast,
    createInvoice,
    updateSchoolPrice,
    confirmPayment,
    deleteInvoice,
    scheduleReminder,
    markReminderSent,
    showToast,
  }
}

import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  apiErrorMessage,
  financeData,
  normalizeSchool,
} from '../services/api'

export function useFinanceStore(showToast) {
  const queryClient = useQueryClient()

  const dashboardQuery = useQuery({
    queryKey: ['finance', 'dashboard'],
    queryFn: async () => (await financeData.dashboard()).data.data,
  })

  const schoolsQuery = useQuery({
    queryKey: ['finance', 'schools'],
    queryFn: async () => {
      const rows = (await financeData.schools()).data.data || []
      return rows.map(normalizeSchool)
    },
  })

  const invoicesQuery = useQuery({
    queryKey: ['finance', 'invoices'],
    queryFn: async () => (await financeData.invoices()).data.data || [],
  })

  const remindersQuery = useQuery({
    queryKey: ['finance', 'reminders'],
    queryFn: async () => (await financeData.reminders()).data.data || [],
  })

  const settingsQuery = useQuery({
    queryKey: ['finance', 'settings'],
    queryFn: async () => (await financeData.settings()).data.data,
  })

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['finance'] })
  }, [queryClient])

  const schools = schoolsQuery.data || []
  const invoices = invoicesQuery.data || []
  const reminders = remindersQuery.data || []
  const dashboard = dashboardQuery.data

  const schoolMap = useMemo(
    () => Object.fromEntries(schools.map((s) => [s.id, s])),
    [schools],
  )

  const deliveries = useMemo(() => {
    return invoices.flatMap((inv) =>
      (inv.deliveries || []).map((d) => ({
        ...d,
        invoiceId: inv.id,
      })),
    )
  }, [invoices])

  const stats = useMemo(() => {
    if (dashboard?.stats) {
      return {
        collected: dashboard.stats.collected,
        outstanding: dashboard.stats.outstanding,
        pendingCount: invoices.filter((i) => i.status === 'pending').length,
        overdueCount: dashboard.stats.overdueCount,
        schoolsActive: dashboard.stats.activeSchools,
        remindersDue: dashboard.stats.remindersDue,
      }
    }
    return {
      collected: 0,
      outstanding: 0,
      pendingCount: 0,
      overdueCount: 0,
      schoolsActive: schools.length,
      remindersDue: 0,
    }
  }, [dashboard, invoices, schools.length])

  const revenueSeries = dashboard?.revenueSeries || []

  const createInvoice = useMutation({
    mutationFn: async ({ schoolId, discountPercent, notes, dueAt }) => {
      const res = await financeData.createInvoice({
        school_id: Number(schoolId),
        discount_percent: Number(discountPercent) || 0,
        notes: notes || null,
        due_at: dueAt || null,
      })
      return res.data.data
    },
    onSuccess: (invoice) => {
      invalidateAll()
      showToast?.(`Invoice ${invoice.id} created`)
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not create invoice')),
  })

  const updateSchoolPrice = useMutation({
    mutationFn: async ({ schoolId, price }) => {
      const res = await financeData.updateBilling(schoolId, { price: Number(price) || 0 })
      return res.data.data
    },
    onSuccess: () => {
      invalidateAll()
      showToast?.('School subscription price updated')
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not update price')),
  })

  const confirmPayment = useMutation({
    mutationFn: async ({ invoiceId, reference, paidAt, note }) => {
      const res = await financeData.confirmPayment(invoiceId, {
        reference: reference || null,
        paid_at: paidAt || null,
        note: note || null,
      })
      return res.data.data
    },
    onSuccess: (invoice) => {
      invalidateAll()
      showToast?.(`Payment confirmed for ${invoice.id}`)
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not confirm payment')),
  })

  const deleteInvoice = useMutation({
    mutationFn: async (invoiceId) => {
      await financeData.deleteInvoice(invoiceId)
      return invoiceId
    },
    onSuccess: (invoiceId) => {
      invalidateAll()
      showToast?.(`Invoice ${invoiceId} deleted`)
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not delete invoice')),
  })

  const sendInvoiceEmail = useMutation({
    mutationFn: async (invoiceId) => {
      const res = await financeData.sendInvoiceEmail(invoiceId)
      return res.data
    },
    onSuccess: (payload) => {
      invalidateAll()
      showToast?.(payload?.message || 'Invoice email sent')
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not send email')),
  })

  const scheduleReminder = useMutation({
    mutationFn: async ({ invoiceId, channel, scheduledFor, message }) => {
      if (channel === 'whatsapp') {
        throw new Error('WhatsApp reminders are coming later')
      }
      const res = await financeData.scheduleReminder({
        invoice_id: invoiceId,
        channel: 'email',
        scheduled_for: scheduledFor,
        message,
      })
      return res.data.data
    },
    onSuccess: () => {
      invalidateAll()
      showToast?.('Email reminder scheduled')
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not schedule reminder')),
  })

  const markReminderSent = useMutation({
    mutationFn: async (reminderId) => {
      const res = await financeData.markReminderSent(reminderId)
      return res.data.data
    },
    onSuccess: () => {
      invalidateAll()
      showToast?.('Reminder marked as sent')
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not update reminder')),
  })

  const sendReminderEmail = useMutation({
    mutationFn: async ({ reminderId, message }) => {
      const res = await financeData.sendReminderEmail(reminderId, {
        message: message || undefined,
      })
      return res.data
    },
    onSuccess: (payload) => {
      invalidateAll()
      showToast?.(payload?.message || 'Reminder email sent')
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not send reminder')),
  })

  const saveSettings = useMutation({
    mutationFn: async (payload) => {
      const res = await financeData.updateSettings(payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'settings'] })
      showToast?.('Settings saved')
    },
    onError: (err) => showToast?.(apiErrorMessage(err, 'Could not save settings')),
  })

  const loading =
    dashboardQuery.isLoading ||
    schoolsQuery.isLoading ||
    invoicesQuery.isLoading ||
    remindersQuery.isLoading

  return {
    loading,
    schools,
    schoolMap,
    invoices,
    reminders,
    deliveries,
    stats,
    revenueSeries,
    settings: settingsQuery.data,
    createInvoice: (form) => createInvoice.mutateAsync(form),
    updateSchoolPrice: (schoolId, price) => updateSchoolPrice.mutateAsync({ schoolId, price }),
    confirmPayment: (form) => confirmPayment.mutateAsync(form),
    deleteInvoice: (id) => deleteInvoice.mutateAsync(id),
    sendInvoiceEmail: (id) => sendInvoiceEmail.mutateAsync(id),
    scheduleReminder: (form) => scheduleReminder.mutateAsync(form),
    markReminderSent: (id) => markReminderSent.mutateAsync(id),
    sendReminderEmail: (id, message) =>
      sendReminderEmail.mutateAsync({ reminderId: id, message }),
    saveSettings: (payload) => saveSettings.mutateAsync(payload),
    refresh: invalidateAll,
  }
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }, [])
  return { toast, showToast }
}

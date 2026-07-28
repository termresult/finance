import axios from 'axios'

const TOKEN_KEY = 'termresult-finance-token'
const ADMIN_KEY = 'termresult-finance-admin'

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  if (envUrl) {
    return String(envUrl).replace(/\/$/, '')
  }
  return '/api'
}

export function getFinanceToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setFinanceSession({ token, admin }) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
  if (admin) {
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  }
  // legacy flag used by older gate
  sessionStorage.setItem('termresult-admin', 'authenticated')
}

export function clearFinanceSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(ADMIN_KEY)
  sessionStorage.removeItem('termresult-admin')
}

export function getFinanceAdmin() {
  try {
    return JSON.parse(sessionStorage.getItem(ADMIN_KEY) || 'null')
  } catch {
    return null
  }
}

export function isFinanceAuthenticated() {
  return Boolean(getFinanceToken())
}

export const financeApi = axios.create({
  baseURL: `${getApiBaseUrl()}/finance-admin`,
  withCredentials: true,
})

financeApi.interceptors.request.use((config) => {
  const token = getFinanceToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

financeApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearFinanceSession()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/setup')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

export function apiErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || err?.message || fallback
}

export const financeAuth = {
  exists: () => financeApi.get('/exists'),
  setup: (payload) => financeApi.post('/setup', payload),
  login: (payload) => financeApi.post('/login', payload),
  me: () => financeApi.get('/me'),
  logout: () => financeApi.post('/logout'),
}

export const financeData = {
  dashboard: () => financeApi.get('/dashboard'),
  schools: () => financeApi.get('/schools'),
  updateBilling: (id, payload) => financeApi.patch(`/schools/${id}/billing`, payload),
  invoices: (params) => financeApi.get('/invoices', { params }),
  createInvoice: (payload) => financeApi.post('/invoices', payload),
  deleteInvoice: (id) => financeApi.delete(`/invoices/${encodeURIComponent(id)}`),
  confirmPayment: (id, payload) =>
    financeApi.post(`/invoices/${encodeURIComponent(id)}/confirm-payment`, payload),
  sendInvoiceEmail: (id) =>
    financeApi.post(`/invoices/${encodeURIComponent(id)}/send-email`),
  reminders: () => financeApi.get('/reminders'),
  scheduleReminder: (payload) => financeApi.post('/reminders', payload),
  markReminderSent: (id) => financeApi.post(`/reminders/${id}/mark-sent`),
  sendReminderEmail: (id, payload = {}) =>
    financeApi.post(`/reminders/${id}/send-email`, payload),
  settings: () => financeApi.get('/settings'),
  updateSettings: (payload) => financeApi.put('/settings', payload),
  admins: () => financeApi.get('/admins'),
  createAdmin: (payload) => financeApi.post('/admins', payload),
  updateAdmin: (id, payload) => financeApi.put(`/admins/${id}`, payload),
  deactivateAdmin: (id) => financeApi.post(`/admins/${id}/deactivate`),
  activateAdmin: (id) => financeApi.post(`/admins/${id}/activate`),
}

export function schoolCode(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'SC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function normalizeSchool(school) {
  return {
    ...school,
    code: schoolCode(school.name),
    city: school.city || school.state || '',
    contact: school.contact || '',
    email: school.email || school.billing_email || '',
    phone: school.phone || '',
    students: Number(school.students) || 0,
    price: Number(school.price) || 0,
  }
}

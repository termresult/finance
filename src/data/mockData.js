const today = new Date()

function daysFromNow(n) {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const initialSchools = [
  {
    id: 'sch-001',
    name: 'Greenfield International School',
    code: 'GIS',
    city: 'Lagos',
    contact: 'Adaeze Okonkwo',
    email: 'billing@greenfield.edu.ng',
    phone: '+234 803 441 2201',
    plan: 'Premium',
    students: 842,
    price: 2500,
    status: 'active',
  },
  {
    id: 'sch-002',
    name: 'St. Helena Academy',
    code: 'SHA',
    city: 'Abuja',
    contact: 'Chinedu Bello',
    email: 'accounts@sthelena.ng',
    phone: '+234 809 112 9088',
    plan: 'Standard',
    students: 510,
    price: 2200,
    status: 'active',
  },
  {
    id: 'sch-003',
    name: 'Riverbank College',
    code: 'RBC',
    city: 'Port Harcourt',
    contact: 'Ngozi Hart',
    email: 'finance@riverbank.edu',
    phone: '+234 701 554 3310',
    plan: 'Premium',
    students: 1204,
    price: 1800,
    status: 'active',
  },
  {
    id: 'sch-004',
    name: 'Oakridge Secondary',
    code: 'ORS',
    city: 'Ibadan',
    contact: 'Tunde Afolabi',
    email: 'admin@oakridge.sch.ng',
    phone: '+234 812 667 4402',
    plan: 'Basic',
    students: 326,
    price: 3000,
    status: 'active',
  },
  {
    id: 'sch-005',
    name: 'Meadowlane High',
    code: 'MLH',
    city: 'Enugu',
    contact: 'Ifeoma Nwosu',
    email: 'bursar@meadowlane.ng',
    phone: '+234 706 889 1212',
    plan: 'Standard',
    students: 688,
    price: 2000,
    status: 'paused',
  },
]

export const planRates = {
  Basic: 85000,
  Standard: 150000,
  Premium: 245000,
}

export const initialInvoices = [
  {
    id: 'INV-2026-014',
    schoolId: 'sch-001',
    amount: 245000,
    period: '2026 Term 2',
    issuedAt: daysFromNow(-18),
    dueAt: daysFromNow(-3),
    status: 'overdue',
    notes: 'Subscription renewal — Premium plan',
  },
  {
    id: 'INV-2026-015',
    schoolId: 'sch-002',
    amount: 150000,
    period: '2026 Term 2',
    issuedAt: daysFromNow(-12),
    dueAt: daysFromNow(5),
    status: 'pending',
    notes: 'Standard plan billing',
  },
  {
    id: 'INV-2026-016',
    schoolId: 'sch-003',
    amount: 245000,
    period: '2026 Term 2',
    issuedAt: daysFromNow(-10),
    dueAt: daysFromNow(8),
    status: 'pending',
    notes: 'Premium plan — multi-campus',
  },
  {
    id: 'INV-2026-017',
    schoolId: 'sch-004',
    amount: 85000,
    period: '2026 Term 2',
    issuedAt: daysFromNow(-25),
    dueAt: daysFromNow(-10),
    status: 'paid',
    paidAt: daysFromNow(-8),
    notes: 'Confirmed via bank transfer',
    reference: 'TRF-991204',
  },
  {
    id: 'INV-2026-018',
    schoolId: 'sch-005',
    amount: 150000,
    period: '2026 Term 1',
    issuedAt: daysFromNow(-40),
    dueAt: daysFromNow(-20),
    status: 'overdue',
    notes: 'Awaiting transfer confirmation',
  },
  {
    id: 'INV-2026-012',
    schoolId: 'sch-001',
    amount: 245000,
    period: '2026 Term 1',
    issuedAt: daysFromNow(-95),
    dueAt: daysFromNow(-70),
    status: 'paid',
    paidAt: daysFromNow(-68),
    notes: 'Paid on time',
    reference: 'TRF-880112',
  },
  {
    id: 'INV-2026-013',
    schoolId: 'sch-003',
    amount: 245000,
    period: '2026 Term 1',
    issuedAt: daysFromNow(-90),
    dueAt: daysFromNow(-65),
    status: 'paid',
    paidAt: daysFromNow(-64),
    notes: 'Bank transfer verified',
    reference: 'TRF-880441',
  },
]

export const initialReminders = [
  {
    id: 'rem-01',
    invoiceId: 'INV-2026-014',
    schoolId: 'sch-001',
    channel: 'email',
    scheduledFor: daysFromNow(-2),
    status: 'sent',
    message: 'Friendly reminder: Invoice INV-2026-014 is past due.',
  },
  {
    id: 'rem-02',
    invoiceId: 'INV-2026-014',
    schoolId: 'sch-001',
    channel: 'whatsapp',
    scheduledFor: daysFromNow(-1),
    status: 'sent',
    message: 'WhatsApp follow-up for overdue Premium subscription.',
  },
  {
    id: 'rem-03',
    invoiceId: 'INV-2026-015',
    schoolId: 'sch-002',
    channel: 'email',
    scheduledFor: daysFromNow(2),
    status: 'scheduled',
    message: 'Upcoming due date reminder for INV-2026-015.',
  },
  {
    id: 'rem-04',
    invoiceId: 'INV-2026-018',
    schoolId: 'sch-005',
    channel: 'whatsapp',
    scheduledFor: daysFromNow(1),
    status: 'scheduled',
    message: 'Final notice before account pause review.',
  },
  {
    id: 'rem-05',
    invoiceId: 'INV-2026-016',
    schoolId: 'sch-003',
    channel: 'email',
    scheduledFor: daysFromNow(4),
    status: 'scheduled',
    message: 'Payment due in one week — Riverbank College.',
  },
]

export const revenueSeries = [
  { month: 'Jan', collected: 520000, outstanding: 180000 },
  { month: 'Feb', collected: 610000, outstanding: 210000 },
  { month: 'Mar', collected: 480000, outstanding: 260000 },
  { month: 'Apr', collected: 720000, outstanding: 150000 },
  { month: 'May', collected: 690000, outstanding: 190000 },
  { month: 'Jun', collected: 740000, outstanding: 230000 },
  { month: 'Jul', collected: 575000, outstanding: 395000 },
]

export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function nextInvoiceId(invoices) {
  const nums = invoices.map((inv) => Number(inv.id.split('-').pop())).filter(Boolean)
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0')
  return `INV-2026-${next}`
}

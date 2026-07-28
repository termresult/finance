export function getLatestInvoiceEmailDelivery(deliveries, invoice) {
  const invoiceKeys = new Set([String(invoice.id), String(invoice.db_id)])

  return (
    deliveries
      .filter(
        (delivery) =>
          invoiceKeys.has(String(delivery.invoiceId)) &&
          delivery.channel === 'email' &&
          delivery.status === 'sent' &&
          delivery.sentAt,
      )
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0] || null
  )
}

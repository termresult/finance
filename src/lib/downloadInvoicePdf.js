import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { buildInvoicePdfFilename } from './invoicePdf'

function buildPagedPdf(canvas) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - margin * 2
  const pageContentHeight = pageHeight - margin * 2

  // Scale image to page width, then slice vertically across pages.
  const pxPerMm = canvas.width / contentWidth
  const pageSlicePx = Math.floor(pageContentHeight * pxPerMm)

  let sourceY = 0
  let pageIndex = 0

  while (sourceY < canvas.height) {
    const sliceHeight = Math.min(pageSlicePx, canvas.height - sourceY)
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight

    const ctx = pageCanvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )

    const sliceMm = sliceHeight / pxPerMm
    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceMm)

    sourceY += sliceHeight
    pageIndex += 1
  }

  return pdf
}

export async function downloadInvoicePdf({ element, school, invoice }) {
  if (!element) {
    throw new Error('Invoice document is not ready to download.')
  }

  // Clone outside the scrollable modal so html2canvas captures the full invoice.
  const clone = element.cloneNode(true)
  clone.removeAttribute('id')
  clone.style.position = 'fixed'
  clone.style.left = '-10000px'
  clone.style.top = '0'
  clone.style.width = '794px'
  clone.style.maxHeight = 'none'
  clone.style.height = 'auto'
  clone.style.overflow = 'visible'
  clone.style.background = '#ffffff'
  clone.style.borderRadius = '0'
  clone.style.boxShadow = 'none'
  document.body.appendChild(clone)

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    })

    const pdf = buildPagedPdf(canvas)
    pdf.save(buildInvoicePdfFilename({ school, invoice }))
  } finally {
    clone.remove()
  }
}

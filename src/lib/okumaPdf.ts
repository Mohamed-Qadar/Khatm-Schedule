import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function renderOkumaPdfFromElements(pageElements: HTMLElement[]): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

  for (let index = 0; index < pageElements.length; index += 1) {
    const canvas = await html2canvas(pageElements[index], {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })

    const imageData = canvas.toDataURL('image/png')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    if (index > 0) {
      doc.addPage()
    }

    doc.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight)
  }

  return doc.output('blob')
}

export function buildOkumaProgramFileName(educationYear: string, suffix: string): string {
  const safeYear = educationYear.trim().replace(/[^0-9-]+/g, '_') || 'okuma_programi'

  return `Okuma_Programi_${safeYear}${suffix}.pdf`
}

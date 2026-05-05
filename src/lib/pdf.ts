import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { HatimSchedule, ReadingSection } from '../types'
import { sanitizeFileName } from './file'

const PAGE_WIDTH = 595.28
const MARGIN_X = 28
const TOP_MARGIN = 30
const GAP_BETWEEN_TABLES = 60

function createDoc(): jsPDF {
  return new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
}

function addPageTitle(doc: jsPDF, title: string, subtitle?: string): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(14, 35, 64)
  doc.text(title, MARGIN_X, TOP_MARGIN)

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(82, 96, 118)
    doc.text(subtitle, MARGIN_X, TOP_MARGIN + 18)
    return TOP_MARGIN + 30
  }

  return TOP_MARGIN + 24
}

function tableStyles() {
  return {
    theme: 'grid' as const,
    margin: { left: MARGIN_X, right: MARGIN_X },
    tableWidth: PAGE_WIDTH - MARGIN_X * 2,
    styles: {
      font: 'helvetica',
      fontSize: 12,
      cellPadding: 2.5,
      lineColor: [56, 78, 107] as [number, number, number],
      lineWidth: 0.7,
      textColor: [28, 36, 46] as [number, number, number],
      valign: 'middle' as const,
    },
    headStyles: {
      fillColor: [33, 65, 101] as [number, number, number],
      textColor: 255,
      fontStyle: 'bold' as const,
      halign: 'center' as const,
    },
    bodyStyles: {
      halign: 'center' as const,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number],
    },
    rowPageBreak: 'avoid' as const,
    showHead: 'everyPage' as const,
  }
}

function splitHatimRows(rows: HatimSchedule['rows']): HatimSchedule['rows'][] {
  return [
    rows.slice(0, 8),
    rows.slice(8, 16),
    rows.slice(16, 23),
    rows.slice(23, 30),
  ]
}

function createHatimSchedulePdf(schedule: HatimSchedule): Blob {
  const doc = createDoc()

  const subtitle = `Adı Soyadı: ${schedule.name} | Hatim No: ${schedule.hatimNo} | Başlangıç Tarihi: ${schedule.startDate}`
  let currentY = addPageTitle(doc, 'Hatim Çizelgesi', subtitle)
  const chunks = splitHatimRows(schedule.rows)

  chunks.forEach((chunk, index) => {
    autoTable(doc, {
      ...tableStyles(),
      startY: currentY,
      head: [['Tarih', 'Cüz']],
      body: chunk.map((row) => [row.date, String(row.cuz)]),
    })

    currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY

    if (index < chunks.length - 1) {
      currentY += GAP_BETWEEN_TABLES
    }
  })

  return doc.output('blob')
}

export function buildHatimSinglePdfBlob(schedules: HatimSchedule[]): Blob {
  const doc = createDoc()

  schedules.forEach((schedule, index) => {
    if (index > 0) {
      doc.addPage()
    }

    const subtitle = `Adı Soyadı: ${schedule.name} | Hatim No: ${schedule.hatimNo} | Başlangıç Tarihi: ${schedule.startDate}`
    let currentY = addPageTitle(doc, 'Hatim Çizelgesi', subtitle)
    const chunks = splitHatimRows(schedule.rows)

    chunks.forEach((chunk, chunkIndex) => {
      autoTable(doc, {
        ...tableStyles(),
        startY: currentY,
        head: [['Tarih', 'Cüz']],
        body: chunk.map((row) => [row.date, String(row.cuz)]),
      })

      currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY

      if (chunkIndex < chunks.length - 1) {
        currentY += GAP_BETWEEN_TABLES
      }
    })
  })

  return doc.output('blob')
}

export function buildHatimMultiPdfFiles(schedules: HatimSchedule[]): Array<{ fileName: string; blob: Blob }> {
  return schedules.map((schedule) => ({
    fileName: `${sanitizeFileName(`Hatim_Cizelgesi_${schedule.hatimNo}_${schedule.name}`)}.pdf`,
    blob: createHatimSchedulePdf(schedule),
  }))
}

function hasReadingContent(section: ReadingSection): boolean {
  return section.tables.some((table) =>
    table.rows.some((row) => row.date.trim() || row.city.trim() || row.student.trim()),
  )
}

export function buildReadingProgramPdfBlob(sections: ReadingSection[]): Blob {
  const doc = createDoc()
  let hasRendered = false

  sections.forEach((section) => {
    const sectionHasContent = hasReadingContent(section)

    if (!sectionHasContent) {
      return
    }

    if (hasRendered) {
      doc.addPage()
    }

    hasRendered = true
    let currentY = addPageTitle(doc, 'Okuma Programı', section.title)

    section.tables.forEach((table, tableIndex) => {
      const activeRows = table.rows.filter(
        (row) => row.date.trim() || row.city.trim() || row.student.trim(),
      )

      if (!activeRows.length) {
        return
      }

      if (tableIndex > 0) {
        currentY += GAP_BETWEEN_TABLES
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(33, 65, 101)
      doc.text(table.heading.trim() || 'İl Tablosu', MARGIN_X, currentY)
      currentY += 8

      autoTable(doc, {
        ...tableStyles(),
        startY: currentY,
        head: [['Tarih', 'Şehir', 'Öğrenci']],
        body: activeRows.map((row) => [row.date, row.city, row.student]),
      })

      currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY
    })
  })

  return doc.output('blob')
}

export function buildReadingSectionPdfFiles(sections: ReadingSection[]): Array<{ fileName: string; blob: Blob }> {
  return sections
    .filter(hasReadingContent)
    .map((section) => ({
      fileName: `${sanitizeFileName(`Okuma_Programi_${section.title}`)}.pdf`,
      blob: buildReadingProgramPdfBlob([section]),
    }))
}

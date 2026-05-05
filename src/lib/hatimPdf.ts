import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { HatimSchedule } from '../types'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildMiniTableHtml(rows: HatimSchedule['rows']): string {
  return `
    <table class="hatim-mini-table">
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Cüz</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.date)}</td>
                <td>${row.cuz}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `
}

function buildSinglePageHtml(schedule: HatimSchedule): string {
  const rows = [schedule.rows.slice(0, 10), schedule.rows.slice(10, 20), schedule.rows.slice(20, 30)]

  return `
    <section class="hatim-page" data-export-page="true">
      <div class="hatim-page__grid">
        <article class="hatim-card">
          <header class="hatim-card__header">
            <div class="hatim-card__name">${escapeHtml(schedule.name)}</div>
            <div class="hatim-card__no">Hatim no-${escapeHtml(schedule.hatimNo)}</div>
          </header>
          <div class="hatim-card__body">
            ${rows.map((rowsChunk) => buildMiniTableHtml(rowsChunk)).join('')}
          </div>
          <footer class="hatim-card__note">
            <strong>NOT:</strong>
            <p>• Hatimler senelik olup aralıkta yenilenir.</p>
            <p>• Tarihler cüzün bitmesi gereken tarihtir.</p>
          </footer>
        </article>
        <div class="hatim-card hatim-card--empty"></div>
        <div class="hatim-card hatim-card--empty"></div>
        <div class="hatim-card hatim-card--empty"></div>
      </div>
    </section>
  `
}

export async function renderHatimPdfFromElement(pageElements: HTMLElement[]): Promise<Blob> {
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

export function buildHatimScheduleFileName(schedule: HatimSchedule): string {
  const safeName = schedule.name
    .normalize('NFKD')
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '_')

  return `Hatim_Cizelgesi_${schedule.hatimNo}_${safeName}.pdf`
}

export function createHatimSinglePageElement(schedule: HatimSchedule): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'hatim-export-staging'
  wrapper.innerHTML = buildSinglePageHtml(schedule)

  const page = wrapper.querySelector<HTMLElement>('[data-export-page="true"]')

  if (!page) {
    throw new Error('Hatim sayfası oluşturulamadı.')
  }

  document.body.appendChild(wrapper)

  return page
}

export function cleanupHatimSinglePageElement(page: HTMLElement): void {
  const wrapper = page.parentElement

  if (wrapper && wrapper.classList.contains('hatim-export-staging')) {
    wrapper.remove()
  }
}

import { useMemo, useRef, useState } from 'react'
import '@fontsource/noto-serif/latin-ext.css'
import { HatimDocument } from './HatimDocument'
import {
  buildHatimScheduleFileName,
  renderHatimPdfFromElement,
} from '../lib/hatimPdf'
import { addDays, formatHatimCardDate, parseTurkishDate, isNonEmptyText } from '../lib/date'
import { downloadBlob } from '../lib/file'
import type { HatimSchedule } from '../types'

interface HatimModuleProps {
  onBack: () => void
}

interface HatimFormState {
  name: string
  hatimNo: string
  startDate: string
}

const emptyForm: HatimFormState = {
  name: '',
  hatimNo: '',
  startDate: '',
}

function buildHatimRows(startDate: string, participantIndex: number) {
  const parsed = parseTurkishDate(startDate)

  if (!parsed) {
    return null
  }

  return Array.from({ length: 30 }, (_, index) => {
    const currentDate = addDays(parsed, index * 7)
    const cuzNumber = ((participantIndex + index) % 30) + 1

    return {
      cuz: cuzNumber,
      date: formatHatimCardDate(currentDate),
    }
  })
}

export function HatimModule({ onBack }: HatimModuleProps) {
  const [form, setForm] = useState<HatimFormState>(emptyForm)
  const [schedules, setSchedules] = useState<HatimSchedule[]>([])
  const [message, setMessage] = useState('')
  const exportRef = useRef<HTMLDivElement | null>(null)

  const canCreate = useMemo(
    () => isNonEmptyText(form.name) && isNonEmptyText(form.hatimNo) && isNonEmptyText(form.startDate),
    [form.hatimNo, form.name, form.startDate],
  )

  function showMessage(text: string) {
    setMessage(text)
    window.setTimeout(() => {
      setMessage((current) => (current === text ? '' : current))
    }, 3000)
  }

  function handleCreate() {
    const participantIndex = schedules.length
    const rows = buildHatimRows(form.startDate, participantIndex)

    if (!canCreate) {
      showMessage('Lütfen adı, hatim numarasını ve başlangıç tarihini doldurun.')
      return
    }

    if (!rows) {
      showMessage('Başlangıç tarihi gg/aa/yyyy formatında ve geçerli olmalıdır.')
      return
    }

    const newSchedule: HatimSchedule = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      hatimNo: form.hatimNo.trim(),
      startDate: form.startDate.trim(),
      rows,
    }

    setSchedules((current) => [...current, newSchedule])
    setMessage('Hatim çizelgesi oluşturuldu.')
  }

  function handleNewSchedule() {
    setForm(emptyForm)
    setMessage('Yeni hatim için form temizlendi.')
  }

  function handleClear() {
    setForm(emptyForm)
    setSchedules([])
    setMessage('Tüm hatim verileri temizlendi.')
  }

  async function captureExportPages() {
    const exportRoot = exportRef.current

    if (!exportRoot) {
      return null
    }

    await document.fonts.ready
    const pages = Array.from(exportRoot.querySelectorAll<HTMLElement>('[data-export-page="true"]'))

    if (!pages.length) {
      return null
    }

    return renderHatimPdfFromElement(pages)
  }

  async function handleSinglePdf() {
    if (!schedules.length) {
      showMessage('Lütfen önce hatim çizelgesi oluşturun.')
      return
    }

    const blob = await captureExportPages()

    if (!blob) {
      showMessage('PDF hazırlanamadı.')
      return
    }

    const first = schedules[0]
    const fileName = buildHatimScheduleFileName(first)

    downloadBlob(blob, fileName)
  }

  async function handleMultiPdf() {
    if (!schedules.length) {
      showMessage('Lütfen önce hatim çizelgesi oluşturun.')
      return
    }

    const blob = await captureExportPages()

    if (!blob) {
      showMessage('PDF hazırlanamadı.')
      return
    }

    const first = schedules[0]
    const fileName = schedules.length === 1
      ? buildHatimScheduleFileName(first)
      : `Hatim_Cizelgesi_${first.hatimNo}_toplu.pdf`

    downloadBlob(blob, fileName)
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <button className="ghost-button" onClick={onBack}>
          Ana Sayfa
        </button>
        <div>
          <span className="eyebrow">Modül 1</span>
          <h1>Hatim Çizelgesi</h1>
          <p>
            Ad, hatim numarası ve başlangıç tarihini girin. Sistem 30 cüz için 7
            günlük aralıklarla kart oluşturur.
          </p>
        </div>
      </header>

      <section className="panel form-panel">
        <div className="form-grid">
          <label>
            <span>Adı Soyadı</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Örn. Ahmet Yılmaz"
            />
          </label>

          <label>
            <span>Hatim No</span>
            <input
              value={form.hatimNo}
              onChange={(event) => setForm((current) => ({ ...current, hatimNo: event.target.value }))}
              placeholder="Örn. 12"
            />
          </label>

          <label>
            <span>Başlangıç Tarihi (gg/aa/yyyy)</span>
            <input
              value={form.startDate}
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              placeholder="01/04/2026"
              inputMode="numeric"
            />
          </label>
        </div>

        <div className="toolbar">
          <button className="primary-button" onClick={handleCreate}>
            Kart Oluştur
          </button>
          <button className="secondary-button" onClick={handleNewSchedule}>
            Yeni Hatim Ekle
          </button>
          <button className="secondary-button" onClick={handleSinglePdf}>
            Tek PDF İndir
          </button>
          <button className="secondary-button" onClick={handleMultiPdf}>
            Çoklu PDF İndir
          </button>
          <button className="ghost-button" onClick={handleClear}>
            Temizle
          </button>
        </div>

        {message ? <div className="notice">{message}</div> : null}
      </section>

      <section className="preview-column hatim-preview-wrapper">
        {schedules.length ? (
          <div className="hatim-preview-scroll">
            <HatimDocument schedules={schedules} mode="preview" />
          </div>
        ) : (
          <div className="panel empty-state">
            <h2>Henüz çizelge yok</h2>
            <p>Bilgileri girip Çizelge Oluştur ile ilk hatim planını hazırlayın.</p>
          </div>
        )}
      </section>

      <div ref={exportRef} className="hatim-export-root" aria-hidden="true">
        <HatimDocument schedules={schedules} mode="export" />
      </div>
    </main>
  )
}

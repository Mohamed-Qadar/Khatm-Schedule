import { useMemo, useRef, useState } from 'react'
import '@fontsource/noto-serif/latin-ext.css'
import { OkumaPrintableDocument } from './OkumaPrintableDocument'
import { buildOkumaProgramFileName, renderOkumaPdfFromElements } from '../lib/okumaPdf'
import { downloadBlob } from '../lib/file'
import type {
  OkumaCityTable,
  OkumaProgramConfig,
  OkumaReadingType,
  OkumaStudentRow,
  OkumaTerm,
  OkumaUnnamedName,
} from '../types'

interface OkumaModuleProps {
  onBack: () => void
}

const TERM_OPTIONS: OkumaTerm[] = ['GÜZ DÖNEM', 'BAHAR DÖNEM']

const READING_TYPE_OPTIONS: OkumaReadingType[] = [
  'VİZE OKUMALARI',
  'FİNAL OKUMALARI',
  'BÜTÜNLEME OKUMALARI',
]

function createUnnamedName(value = ''): OkumaUnnamedName {
  return {
    id: crypto.randomUUID(),
    value,
  }
}

function createStudentRow(student = '', medrese = ''): OkumaStudentRow {
  return {
    id: crypto.randomUUID(),
    student,
    medrese,
  }
}

function createEmptyTable(): OkumaCityTable {
  return {
    id: crypto.randomUUID(),
    heading: '',
    unnumberedNames: [],
    rows: Array.from({ length: 10 }, () => createStudentRow()),
  }
}

function createSampleTable(): OkumaCityTable {
  return {
    id: crypto.randomUUID(),
    heading: 'Urfa (Cumartesi)',
    unnumberedNames: [],
    rows: Array.from({ length: 10 }, () => createStudentRow()),
  }
}

function createInitialState() {
  return {
    config: {
      educationYear: '2025-2026',
      term: 'GÜZ DÖNEM' as OkumaTerm,
      readingType: 'VİZE OKUMALARI' as OkumaReadingType,
    },
    tables: [createSampleTable()],
  }
}

function buildProgramTitle(config: OkumaProgramConfig): string {
  return `${config.educationYear} ${config.term} ${config.readingType}`.trim()
}

function hasOkumaContent(tables: OkumaCityTable[]): boolean {
  return tables.some(
    (table) =>
      table.heading.trim().length > 0 ||
      table.unnumberedNames.some((name) => name.value.trim().length > 0) ||
      table.rows.some((row) => row.student.trim().length > 0 || row.medrese.trim().length > 0),
  )
}

export function OkumaModule({ onBack }: OkumaModuleProps) {
  const initial = createInitialState()
  const [config, setConfig] = useState<OkumaProgramConfig>(initial.config)
  const [tables, setTables] = useState<OkumaCityTable[]>(initial.tables)
  const [message, setMessage] = useState('')
  const exportRef = useRef<HTMLDivElement | null>(null)

  const programTitle = useMemo(() => buildProgramTitle(config), [config])

  function showMessage(text: string) {
    setMessage(text)
    window.setTimeout(() => {
      setMessage((current) => (current === text ? '' : current))
    }, 3000)
  }

  function updateTable(tableId: string, updater: (current: OkumaCityTable) => OkumaCityTable) {
    setTables((current) => current.map((table) => (table.id === tableId ? updater(table) : table)))
  }

  function handleAddTable() {
    setTables((current) => [...current, createEmptyTable()])
    showMessage('Yeni il tablosu eklendi.')
  }

  function handleDeleteTable(tableId: string) {
    setTables((current) => current.filter((table) => table.id !== tableId))
    showMessage('Tablo silindi.')
  }

  function handleAddUnnamedName(tableId: string) {
    updateTable(tableId, (table) => ({
      ...table,
      unnumberedNames: [...table.unnumberedNames, createUnnamedName()],
    }))
  }

  function handleAddUnnamedNameToPrimaryTable() {
    setTables((current) => {
      if (!current.length) {
        const table = createEmptyTable()
        table.unnumberedNames = [...table.unnumberedNames, createUnnamedName()]
        return [table]
      }

      return current.map((table, index) =>
        index === 0
          ? {
              ...table,
              unnumberedNames: [...table.unnumberedNames, createUnnamedName()],
            }
          : table,
      )
    })
  }

  function handleDeleteUnnamedName(tableId: string, nameId: string) {
    updateTable(tableId, (table) => ({
      ...table,
      unnumberedNames: table.unnumberedNames.filter((name) => name.id !== nameId),
    }))
  }

  function clearAll() {
    const initialState = createInitialState()
    setConfig(initialState.config)
    setTables(initialState.tables)
    setMessage('Okuma programı temizlendi.')
  }

  function handleAddStudentRow(tableId: string) {
    updateTable(tableId, (table) => ({
      ...table,
      rows: [...table.rows, createStudentRow()],
    }))
  }

  function handleAddStudentRowToPrimaryTable() {
    setTables((current) => {
      if (!current.length) {
        const table = createEmptyTable()
        table.rows = [...table.rows, createStudentRow()]
        return [table]
      }

      return current.map((table, index) =>
        index === 0
          ? {
              ...table,
              rows: [...table.rows, createStudentRow()],
            }
          : table,
      )
    })
  }

  function handleDeleteStudentRow(tableId: string, rowId: string) {
    updateTable(tableId, (table) => ({
      ...table,
      rows: table.rows.filter((row) => row.id !== rowId),
    }))
  }

  function getValidationError(): string | null {
    if (!config.educationYear.trim()) {
      return 'Lütfen eğitim yılını girin.'
    }

    if (!tables.length) {
      return 'Lütfen önce okuma programı oluşturun.'
    }

    if (tables.some((table) => !table.heading.trim())) {
      return 'Lütfen il ve gün bilgisini girin.'
    }

    return null
  }

  async function handleExport(fileSuffix: string) {
    const validationError = getValidationError()

    if (validationError) {
      showMessage(validationError)
      return
    }

    if (!hasOkumaContent(tables)) {
      showMessage('Lütfen önce okuma programı oluşturun.')
      return
    }

    const exportRoot = exportRef.current

    if (!exportRoot) {
      showMessage('PDF oluşturulamadı.')
      return
    }

    await document.fonts.ready
    const pages = Array.from(exportRoot.querySelectorAll<HTMLElement>('[data-export-page="true"]'))

    if (!pages.length) {
      showMessage('Lütfen önce okuma programı oluşturun.')
      return
    }

    const blob = await renderOkumaPdfFromElements(pages)
    downloadBlob(blob, buildOkumaProgramFileName(config.educationYear, fileSuffix))
  }

  return (
    <main className="app-shell okuma-container okuma-module">
      <header className="page-header okuma-header">
        <button className="ghost-button" onClick={onBack}>
          Ana Sayfa
        </button>
        <div>
          <span className="eyebrow okuma-eyebrow">Modül 2</span>
          <h1 className="okuma-page-title">Okuma Programı</h1>
          <p>
            Eğitim yılı, dönem ve okuma türünü düzenleyin; il/gün tablolarını
            ekleyip okunabilir A4 PDF çıktıları alın.
          </p>
        </div>
      </header>

      <section className="panel okuma-controls-panel okuma-form">
        <div className="okuma-controls-grid">
          <label className="okuma-field">
            <span>Eğitim Yılı</span>
            <input
              value={config.educationYear}
              onChange={(event) => setConfig((current) => ({ ...current, educationYear: event.target.value }))}
              placeholder="2025-2026"
            />
          </label>

          <label className="okuma-field">
            <span>Dönem</span>
            <select
              value={config.term}
              onChange={(event) => setConfig((current) => ({ ...current, term: event.target.value as OkumaTerm }))}
            >
              {TERM_OPTIONS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>

          <label className="okuma-field">
            <span>Okuma Türü</span>
            <select
              value={config.readingType}
              onChange={(event) =>
                setConfig((current) => ({ ...current, readingType: event.target.value as OkumaReadingType }))
              }
            >
              {READING_TYPE_OPTIONS.map((readingType) => (
                <option key={readingType} value={readingType}>
                  {readingType}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="okuma-title-preview">
          <span className="okuma-title-preview__label">Canlı Başlık Önizlemesi</span>
          <div className="okuma-live-title">{programTitle}</div>
        </div>

        <div className="toolbar okuma-actions">
          <button className="primary-button okuma-action-button" onClick={handleAddTable}>
            Yeni İl Ekle
          </button>
          <button className="secondary-button okuma-action-button" onClick={handleAddUnnamedNameToPrimaryTable}>
            Abi Ekle
          </button>
          <button className="secondary-button okuma-action-button" onClick={handleAddStudentRowToPrimaryTable}>
            Öğrenci Satırı Ekle
          </button>
          <button className="secondary-button okuma-action-button" onClick={() => handleExport('')}>
            PDF Olarak Dışa Aktar
          </button>
          <button className="secondary-button okuma-action-button" onClick={() => handleExport('_tum_tablolar')}>
            Çoklu PDF İndir
          </button>
          <button className="ghost-button okuma-action-button" onClick={clearAll}>
            Temizle
          </button>
        </div>

        {message ? <div className="notice okuma-notice">{message}</div> : null}
      </section>

      <section className="okuma-edit-list">
        {tables.map((table) => (
          <article className="panel okuma-editor" key={table.id}>
            <div className="okuma-editor__header">
              <label className="okuma-field okuma-heading-field">
                <span>İl / Gün Bilgisi</span>
                <input
                  value={table.heading}
                  onChange={(event) =>
                    updateTable(table.id, (current) => ({
                      ...current,
                      heading: event.target.value,
                    }))
                  }
                  placeholder="Urfa (Cumartesi)"
                />
              </label>

              <button className="ghost-button okuma-action-button" onClick={() => handleDeleteTable(table.id)}>
                Tabloyu Sil
              </button>
            </div>

            <div className="okuma-unnumbered-section">
              <div className="okuma-section-label">Abiler</div>
              <div className="okuma-unnumbered-list">
                {table.unnumberedNames.map((name) => (
                  <div className="okuma-unnumbered-item" key={name.id}>
                    <input
                      className="okuma-inline-input"
                      value={name.value}
                      onChange={(event) =>
                        updateTable(table.id, (current) => ({
                          ...current,
                          unnumberedNames: current.unnumberedNames.map((currentName) =>
                            currentName.id === name.id ? { ...currentName, value: event.target.value } : currentName,
                          ),
                        }))
                      }
                      placeholder="Numarasız isim"
                    />
                    <button className="mini-button okuma-mini-button" onClick={() => handleDeleteUnnamedName(table.id, name.id)}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
              <button className="secondary-button okuma-inline-action" onClick={() => handleAddUnnamedName(table.id)}>
                Abi Ekle
              </button>
            </div>

            <div className="okuma-table-scroll okuma-edit-row">
              <table className="okuma-edit-table">
                <thead>
                  <tr>
                    <th className="okuma-col-no">No</th>
                    <th>Öğrenci</th>
                    <th>Medrese</th>
                    <th className="okuma-col-actions">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="okuma-no">{index + 1}</td>
                      <td>
                        <input
                          className="okuma-inline-input"
                          value={row.student}
                          onChange={(event) =>
                            updateTable(table.id, (current) => ({
                              ...current,
                              rows: current.rows.map((currentRow) =>
                                currentRow.id === row.id ? { ...currentRow, student: event.target.value } : currentRow,
                              ),
                            }))
                          }
                          placeholder="Öğrenci adı"
                        />
                      </td>
                      <td>
                        <input
                          className="okuma-inline-input"
                          value={row.medrese}
                          onChange={(event) =>
                            updateTable(table.id, (current) => ({
                              ...current,
                              rows: current.rows.map((currentRow) =>
                                currentRow.id === row.id ? { ...currentRow, medrese: event.target.value } : currentRow,
                              ),
                            }))
                          }
                          placeholder="Medrese adı"
                        />
                      </td>
                      <td>
                        <button className="mini-button okuma-mini-button" onClick={() => handleDeleteStudentRow(table.id, row.id)}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="okuma-table-actions">
              <button className="secondary-button okuma-action-button" onClick={() => handleAddStudentRow(table.id)}>
                Öğrenci Satırı Ekle
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="okuma-preview-section okuma-preview-wrapper">
        <div className="okuma-preview-scroll">
          <OkumaPrintableDocument config={config} tables={tables} mode="preview" />
        </div>
      </section>

      <div ref={exportRef} className="okuma-export-root" aria-hidden="true">
        <OkumaPrintableDocument config={config} tables={tables} mode="export" />
      </div>
    </main>
  )
}

import type { OkumaCityTable, OkumaProgramConfig } from '../types'

interface OkumaPrintableDocumentProps {
  config: OkumaProgramConfig
  tables: OkumaCityTable[]
  mode: 'preview' | 'export'
}

function buildProgramTitle(config: OkumaProgramConfig): string {
  return `${config.educationYear} ${config.term} ${config.readingType}`.trim()
}

export function OkumaPrintableDocument({ config, tables, mode }: OkumaPrintableDocumentProps) {
  const programTitle = buildProgramTitle(config)

  return (
    <div className={`okuma-document okuma-document--${mode}`}>
      {tables.map((table) => (
        <section className="okuma-page" data-export-page="true" key={table.id}>
          <div className="okuma-page__inner">
            <h1 className="okuma-title">{programTitle}</h1>
            <div className="okuma-city-heading">{table.heading}</div>

            <table className="okuma-table">
              <thead>
                <tr>
                  <th className="okuma-col-no">No</th>
                  <th>Öğrenci</th>
                  <th className="okuma-col-medrese">Medrese</th>
                </tr>
              </thead>
              <tbody>
                {table.unnumberedNames.map((name) => (
                  <tr className="okuma-row okuma-row--unnumbered" key={name.id}>
                    <td className="okuma-no"></td>
                    <td className="okuma-student">{name.value}</td>
                    <td className="okuma-medrese"></td>
                  </tr>
                ))}

                {table.rows.map((row, index) => (
                  <tr className="okuma-row" key={row.id}>
                    <td className="okuma-no">{index + 1}</td>
                    <td className="okuma-student">{row.student}</td>
                    <td className="okuma-medrese">{row.medrese}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

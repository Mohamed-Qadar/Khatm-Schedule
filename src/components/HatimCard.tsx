import type { HatimSchedule } from '../types'

interface HatimCardProps {
  schedule: HatimSchedule
}

function splitRows(rows: HatimSchedule['rows']) {
  return [rows.slice(0, 10), rows.slice(10, 20), rows.slice(20, 30)]
}

export function HatimCard({ schedule }: HatimCardProps) {
  const miniTables = splitRows(schedule.rows)

  return (
    <article className="hatim-card">
      <header className="hatim-card__header">
        <div className="hatim-card__name">{schedule.name}</div>
        <div className="hatim-card__no">Hatim no-{schedule.hatimNo}</div>
      </header>

      <div className="hatim-card__body">
        {miniTables.map((rows, tableIndex) => (
          <table className="hatim-mini-table" key={`${schedule.id}-${tableIndex}`}>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Cüz</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${schedule.id}-${row.cuz}`}>
                  <td>{row.date}</td>
                  <td>{row.cuz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>

      <footer className="hatim-card__note">
        <strong>NOT:</strong>
        <p>• Her tarih, ilgili cüzün tamamlanması gereken günü gösterir.</p>
        <p>• Çizelge haftalık okuma düzenine göre hazırlanmıştır.</p>
      </footer>
    </article>
  )
}

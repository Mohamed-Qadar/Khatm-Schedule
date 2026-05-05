import { HatimCard } from './HatimCard'
import type { HatimSchedule } from '../types'

interface HatimDocumentProps {
  schedules: HatimSchedule[]
  mode: 'preview' | 'export'
}

function chunkSchedules(schedules: HatimSchedule[]) {
  const pages: HatimSchedule[][] = []

  for (let index = 0; index < schedules.length; index += 4) {
    pages.push(schedules.slice(index, index + 4))
  }

  return pages
}

function HatimPage({ schedules }: { schedules: HatimSchedule[] }) {
  if (schedules.length === 1) {
    return (
      <section className="hatim-page hatim-page--single" data-export-page="true">
        <HatimCard schedule={schedules[0]} />
      </section>
    )
  }

  return (
    <section className="hatim-page" data-export-page="true">
      <div className="hatim-page__grid">
        {Array.from({ length: 4 }, (_, slotIndex) => {
          const schedule = schedules[slotIndex]

          if (!schedule) {
            return <div className="hatim-card hatim-card--empty" key={`empty-${slotIndex}`} />
          }

          return <HatimCard schedule={schedule} key={schedule.id} />
        })}
      </div>
    </section>
  )
}

export function HatimDocument({ schedules, mode }: HatimDocumentProps) {
  const pages = chunkSchedules(schedules)

  return (
    <div className={`hatim-document hatim-document--${mode}`}>
      {pages.map((pageSchedules, pageIndex) => (
        <HatimPage schedules={pageSchedules} key={`page-${pageIndex}`} />
      ))}
    </div>
  )
}

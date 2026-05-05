export function parseTurkishDate(value: string): Date | null {
  const trimmed = value.trim()
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed)

  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])

  const date = new Date(year, month - 1, day, 12)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function formatTurkishDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

const HATIM_MONTHS = ['Oca.', 'Şub.', 'Mar.', 'Nis.', 'May.', 'Haz.', 'Tem.', 'Ağu.', 'Eyl.', 'Eki.', 'Kas.', 'Ara.']

export function formatHatimCardDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = HATIM_MONTHS[date.getMonth()]
  const year = String(date.getFullYear()).slice(-2)

  return `${day} ${month}${year}`
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12)
}

export function isNonEmptyText(value: string): boolean {
  return value.trim().length > 0
}

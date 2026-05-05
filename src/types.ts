export type AppScreen = 'home' | 'hatim' | 'okuma'

export interface HatimRow {
  cuz: number
  date: string
}

export interface HatimSchedule {
  id: string
  name: string
  hatimNo: string
  startDate: string
  rows: HatimRow[]
}

export interface ReadingRow {
  id: string
  date: string
  city: string
  student: string
}

export interface ReadingTable {
  id: string
  heading: string
  rows: ReadingRow[]
}

export interface ReadingSection {
  id: string
  title: string
  tables: ReadingTable[]
}

export type OkumaTerm = 'GÜZ DÖNEM' | 'BAHAR DÖNEM'

export type OkumaReadingType =
  | 'VİZE OKUMALARI'
  | 'FİNAL OKUMALARI'
  | 'BÜTÜNLEME OKUMALARI'

export interface OkumaUnnamedName {
  id: string
  value: string
}

export interface OkumaStudentRow {
  id: string
  student: string
  medrese: string
}

export interface OkumaCityTable {
  id: string
  heading: string
  unnumberedNames: OkumaUnnamedName[]
  rows: OkumaStudentRow[]
}

export interface OkumaProgramConfig {
  educationYear: string
  term: OkumaTerm
  readingType: OkumaReadingType
}

export type Discipline = 'Show Jumping' | 'Dressage'
export type Gender = 'Stallion' | 'Mare' | 'Gelding'

export interface Rider {
  id: string
  name: string
  country: string
  fei_id: string | null
}

export interface Horse {
  id: string
  name: string
  breed: string
  studbook_number: string | null
  date_of_birth: string | null
  gender: Gender | null
  sire: string | null
  dam: string | null
  country: string
  owner: string | null
  current_rider_id: string | null
  created_at: string
}

export interface Competition {
  id: string
  name: string
  level: string
  discipline: Discipline
  date: string
  location: string
  country: string
}

export interface Result {
  id: string
  horse_id: string
  rider_id: string
  competition_id: string
  placement: number | null
  faults: number | null
  time: number | null
  class_name: string | null
  score: number | null
  created_at: string
}

export interface HorseWithDetails extends Horse {
  current_rider: Rider | null
  results: Array<
    Result & {
      rider: Rider
      competition: Competition
    }
  >
}

export interface RankingRow {
  horse_id: string
  horse_name: string
  breed: string
  rider_name: string
  rider_country: string
  discipline: string
  best_level: string
  wins: number
  top3: number
  starts: number
  points: number
}

export const LEVEL_ORDER: Record<string, number> = {
  'CSI1*': 1,
  'CSI2*': 2,
  'CSI3*': 3,
  'CSI4*': 4,
  'CSI5*': 5,
  'GP': 5,
  'CDI1*': 1,
  'CDI2*': 2,
  'CDI3*': 3,
  'CDI4*': 4,
  'CDIO': 5,
  'CDIO5*': 5,
  'CCI1*': 1,
  'CCI2*': 2,
  'CCI3*': 3,
  'CCI4*': 4,
}

export function getBestLevel(levels: string[]): string {
  return levels.reduce((best, level) => {
    const bScore = LEVEL_ORDER[best] ?? 0
    const lScore = LEVEL_ORDER[level] ?? 0
    return lScore > bScore ? level : best
  }, levels[0] ?? '')
}

export function getDominantDiscipline(disciplines: Discipline[]): Discipline {
  const counts = disciplines.reduce<Record<string, number>>((acc, d) => {
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Show Jumping') as Discipline
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Sweden: '🇸🇪',
    Germany: '🇩🇪',
    Netherlands: '🇳🇱',
    France: '🇫🇷',
    Belgium: '🇧🇪',
    Ireland: '🇮🇪',
    'Great Britain': '🇬🇧',
    Switzerland: '🇨🇭',
    Denmark: '🇩🇰',
    Spain: '🇪🇸',
    Italy: '🇮🇹',
    Poland: '🇵🇱',
  }
  return flags[country] ?? '🏳️'
}

export const DISCIPLINES: Discipline[] = ['Show Jumping', 'Dressage']

export const COUNTRIES = [
  'Sweden', 'Germany', 'Netherlands', 'France', 'Belgium', 'Ireland', 'Great Britain',
]

export const BREEDS = ['KWPN', 'Hanoverian', 'SWB', 'Oldenburg', 'BWBS', 'Holsteiner', 'Westphalian']

export const LEVELS = ['GP & 5*', 'CSI 4*', 'CSI 3*', 'CSI 2*–1*', 'Young horses']

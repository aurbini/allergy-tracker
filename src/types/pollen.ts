// TypeScript interfaces for pollen data from both Open-Meteo and Google APIs

export interface PollenDate {
  year: number
  month: number
  day: number
}

export interface PollenIndexInfo {
  code: string
  displayName: string
  value: number
  category: string
  indexDescription: string
  color: {
    green: number
    blue: number
  }
}

export interface PollenTypeInfo {
  code: string
  displayName: string
  indexInfo: PollenIndexInfo
  inSeason: boolean
  healthRecommendations: string[]
}

export interface PlantInfo {
  code: string
  displayName: string
  indexInfo: PollenIndexInfo
  inSeason: boolean
  plantDescription?: {
    type: string
    family: string
    season: string
    specialColors: string
    specialShapes: string
    crossReaction: string
    picture: string
    pictureCloseup: string
  }
}

export interface DailyPollenInfo {
  date: PollenDate
  pollenTypeInfo: PollenTypeInfo[]
  plantInfo: PlantInfo[]
}

export interface PollenData {
  regionCode: string
  dailyInfo: DailyPollenInfo[]
  source: 'openmeteo' | 'google'
  rawData?: {
    current: {
      alder_pollen: number
      birch_pollen: number
      grass_pollen: number
      mugwort_pollen: number
      olive_pollen: number
      ragweed_pollen: number
    }
    location?: {
      latitude: number
      longitude: number
      elevation: number
    }
  }
}

export interface PersonalizedRisk {
  type: 'pollen' | 'plant'
  name: string
  userAllergy: string
  severity: string
  currentIndex: number
  category: string
  riskLevel: string
  recommendation: string
  inSeason?: boolean
  plantDescription?: any
}

export interface PollenApiResponse {
  pollenData: PollenData
  personalizedRisk: PersonalizedRisk[]
  userAllergies: number
}

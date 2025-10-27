import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

import { eq } from 'drizzle-orm'
import { fetchWeatherApi } from 'openmeteo'

import { db } from '@/db/client'
import { allergies, users } from '@/db/schema'
import { authOptions } from '@/lib/authOptions'
import type {
  PersonalizedRisk,
  PollenApiResponse,
  PollenData,
} from '@/types/pollen'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's location from database
    const user = await db
      .select({ latitude: users.latitude, longitude: users.longitude })
      .from(users)
      .where(eq(users.id, parseInt(session.user.id)))
      .limit(1)
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { latitude, longitude } = user[0]
    console.log('Latitude:', latitude)
    console.log('Longitude:', longitude)

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'User location not available' },
        { status: 400 }
      )
    }

    // Get user's allergies from database
    const userAllergies = await db
      .select()
      .from(allergies)
      .where(eq(allergies.userId, parseInt(session.user.id)))

    // Call hybrid pollen API (Open-Meteo primary, Google fallback)
    const pollenData = await fetchPollenDataHybrid(
      Number(latitude),
      Number(longitude)
    )

    // Match user allergies with current pollen data
    const personalizedRisk = matchAllergiesWithPollen(userAllergies, pollenData)

    const response: PollenApiResponse = {
      pollenData,
      personalizedRisk,
      userAllergies: userAllergies.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching pollen data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pollen data' },
      { status: 500 }
    )
  }
}

// Determine if coordinates are in US
function isUSLocation(lat: number, lng: number): boolean {
  return (
    lat >= 24.0 &&
    lat <= 49.0 && // North to South
    lng >= -125.0 &&
    lng <= -66.0 // West to East
  )
}

// Convert Open-Meteo pollen value to Google API scale (0-5)
function convertPollenValue(value: number): number {
  if (value <= 0) return 0
  if (value <= 0.1) return 1
  if (value <= 0.5) return 2
  if (value <= 1.0) return 3
  if (value <= 2.0) return 4
  return 5
}

// Get category from converted value
function getCategoryFromValue(value: number): string {
  if (value <= 0) return 'None'
  if (value <= 1) return 'Very Low'
  if (value <= 2) return 'Low'
  if (value <= 3) return 'Moderate'
  if (value <= 4) return 'High'
  return 'Very High'
}

// Create index info with all required fields
function createIndexInfo(code: string, displayName: string, value: number) {
  return {
    code,
    displayName,
    value,
    category: getCategoryFromValue(value),
    indexDescription: `${displayName} pollen levels`,
    color: {
      green: 0,
      blue: 255,
    },
  }
}

// Fetch pollen data from Open-Meteo
async function fetchOpenMeteoPollenData(
  lat: number,
  lng: number
): Promise<PollenData> {
  const params = {
    latitude: lat,
    longitude: lng,
    hourly: [
      'pm10',
      'pm2_5',
      'alder_pollen',
      'birch_pollen',
      'grass_pollen',
      'mugwort_pollen',
      'olive_pollen',
      'ragweed_pollen',
      'dust',
    ],
    current: [
      'alder_pollen',
      'birch_pollen',
      'grass_pollen',
      'mugwort_pollen',
      'olive_pollen',
      'ragweed_pollen',
    ],
  }

  const url = 'https://air-quality-api.open-meteo.com/v1/air-quality'
  const responses = await fetchWeatherApi(url, params)
  const response = responses[0]

  // Get current data
  const current = response.current()
  if (!current) {
    throw new Error('No current data available from Open-Meteo')
  }

  const currentPollen = {
    alder_pollen: current.variables(0)?.value() || 0,
    birch_pollen: current.variables(1)?.value() || 0,
    grass_pollen: current.variables(2)?.value() || 0,
    mugwort_pollen: current.variables(3)?.value() || 0,
    olive_pollen: current.variables(4)?.value() || 0,
    ragweed_pollen: current.variables(5)?.value() || 0,
  }

  // Calculate combined values
  const treePollen = Math.max(
    currentPollen.alder_pollen,
    currentPollen.birch_pollen,
    currentPollen.olive_pollen
  )
  const weedPollen = Math.max(
    currentPollen.mugwort_pollen,
    currentPollen.ragweed_pollen
  )
  const grassPollen = currentPollen.grass_pollen

  // Convert to Google API format
  return {
    regionCode: isUSLocation(lat, lng) ? 'US' : 'INTL',
    dailyInfo: [
      {
        date: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate(),
        },
        pollenTypeInfo: [
          {
            code: 'TREE',
            displayName: 'Tree',
            indexInfo: createIndexInfo(
              'TREE',
              'Tree',
              convertPollenValue(treePollen)
            ),
            inSeason: treePollen > 0,
            healthRecommendations: ['Monitor your symptoms today.'],
          },
          {
            code: 'GRASS',
            displayName: 'Grass',
            indexInfo: createIndexInfo(
              'GRASS',
              'Grass',
              convertPollenValue(grassPollen)
            ),
            inSeason: grassPollen > 0,
            healthRecommendations: ['Monitor your symptoms today.'],
          },
          {
            code: 'WEED',
            displayName: 'Weed',
            indexInfo: createIndexInfo(
              'WEED',
              'Weed',
              convertPollenValue(weedPollen)
            ),
            inSeason: weedPollen > 0,
            healthRecommendations: ['Monitor your symptoms today.'],
          },
        ],
        plantInfo: [
          {
            code: 'ALDER',
            displayName: 'Alder',
            indexInfo: createIndexInfo(
              'ALDER',
              'Alder',
              convertPollenValue(currentPollen.alder_pollen)
            ),
            inSeason: currentPollen.alder_pollen > 0,
          },
          {
            code: 'BIRCH',
            displayName: 'Birch',
            indexInfo: createIndexInfo(
              'BIRCH',
              'Birch',
              convertPollenValue(currentPollen.birch_pollen)
            ),
            inSeason: currentPollen.birch_pollen > 0,
          },
          {
            code: 'GRASS',
            displayName: 'Grass',
            indexInfo: createIndexInfo(
              'GRASS',
              'Grass',
              convertPollenValue(currentPollen.grass_pollen)
            ),
            inSeason: currentPollen.grass_pollen > 0,
          },
          {
            code: 'MUGWORT',
            displayName: 'Mugwort',
            indexInfo: createIndexInfo(
              'MUGWORT',
              'Mugwort',
              convertPollenValue(currentPollen.mugwort_pollen)
            ),
            inSeason: currentPollen.mugwort_pollen > 0,
          },
          {
            code: 'OLIVE',
            displayName: 'Olive',
            indexInfo: createIndexInfo(
              'OLIVE',
              'Olive',
              convertPollenValue(currentPollen.olive_pollen)
            ),
            inSeason: currentPollen.olive_pollen > 0,
          },
          {
            code: 'RAGWEED',
            displayName: 'Ragweed',
            indexInfo: createIndexInfo(
              'RAGWEED',
              'Ragweed',
              convertPollenValue(currentPollen.ragweed_pollen)
            ),
            inSeason: currentPollen.ragweed_pollen > 0,
          },
        ],
      },
    ],
    source: 'openmeteo',
  }
}

// Fetch pollen data from Google Pollen API
async function fetchGooglePollenData(
  lat: number,
  lng: number
): Promise<PollenData> {
  const apiKey = process.env.GOOGLE_POLLEN_API_KEY

  if (!apiKey) {
    throw new Error('Google Pollen API key not configured')
  }

  const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.longitude=${lng}&location.latitude=${lat}&days=1`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    console.error('API Error:', response.status, response.statusText)
    throw new Error(`Pollen API error: ${response.status}`)
  }

  const data = await response.json()
  return { ...data, source: 'google' }
}

// Main hybrid function
async function fetchPollenDataHybrid(
  lat: number,
  lng: number
): Promise<PollenData> {
  console.log(`🌍 Fetching pollen data for Lat: ${lat}, Lng: ${lng}`)

  const isUS = isUSLocation(lat, lng)
  console.log(`📍 Location is ${isUS ? 'US' : 'International'}`)

  try {
    // Try Open-Meteo first (better for most locations)
    console.log('🌍 Using Open-Meteo API')
    const openMeteoData = await fetchOpenMeteoPollenData(lat, lng)

    // Open-Meteo always provides valid data structure, even if values are 0
    console.log(
      '🔍 Open-Meteo raw data:',
      JSON.stringify(openMeteoData, null, 2)
    )

    // Check if we have any non-zero pollen values
    const hasActivePollen =
      openMeteoData.dailyInfo[0].pollenTypeInfo.some(
        (p) => p.indexInfo.value > 0
      ) ||
      openMeteoData.dailyInfo[0].plantInfo.some((p) => p.indexInfo.value > 0)

    console.log('📊 Has active pollen:', hasActivePollen)

    // Always use Open-Meteo data if we get a valid response (even if all zeros)
    // Only fallback to Google if Open-Meteo completely fails
    console.log('✅ Open-Meteo provided valid data structure')
    return openMeteoData
  } catch (error) {
    console.log(
      `⚠️  Open-Meteo failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )

    // Fallback to Google API
    try {
      console.log('🔄 Falling back to Google Pollen API')
      const googleData = await fetchGooglePollenData(lat, lng)
      console.log('✅ Google API fallback successful')
      return googleData
    } catch (fallbackError) {
      console.log(
        `❌ Both APIs failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
      )
      throw new Error('All pollen data sources failed')
    }
  }
}

function matchAllergiesWithPollen(
  userAllergies: any[],
  pollenData: PollenData
): PersonalizedRisk[] {
  const personalizedRisks: PersonalizedRisk[] = []

  if (!pollenData.dailyInfo || pollenData.dailyInfo.length === 0) {
    return personalizedRisks
  }

  const todayData = pollenData.dailyInfo[0]

  // Match pollen types (Tree, Grass, Weed)
  if (todayData.pollenTypeInfo) {
    for (const pollenType of todayData.pollenTypeInfo) {
      const userAllergy = userAllergies.find(
        (allergy) =>
          allergy.type.toLowerCase() === pollenType.code.toLowerCase()
      )

      if (userAllergy && pollenType.indexInfo) {
        personalizedRisks.push({
          type: 'pollen' as const,
          name: pollenType.displayName,
          userAllergy: userAllergy.pollenName,
          severity: userAllergy.severity,
          currentIndex: pollenType.indexInfo.value,
          category: pollenType.indexInfo.category,
          riskLevel: getPersonalizedRiskLevel(
            pollenType.indexInfo.value,
            userAllergy.severity
          ),
          recommendation:
            pollenType.healthRecommendations?.[0] ||
            'Monitor your symptoms today.',
          inSeason: pollenType.inSeason,
        })
      }
    }
  }

  // Match specific plants
  if (todayData.plantInfo) {
    for (const plant of todayData.plantInfo) {
      const userAllergy = userAllergies.find(
        (allergy) =>
          allergy.pollenName.toLowerCase() ===
            plant.displayName.toLowerCase() ||
          allergy.pollenName.toLowerCase() === plant.code.toLowerCase()
      )

      if (userAllergy && plant.indexInfo) {
        personalizedRisks.push({
          type: 'plant' as const,
          name: plant.displayName,
          userAllergy: userAllergy.pollenName,
          severity: userAllergy.severity,
          currentIndex: plant.indexInfo.value,
          category: plant.indexInfo.category,
          riskLevel: getPersonalizedRiskLevel(
            plant.indexInfo.value,
            userAllergy.severity
          ),
          recommendation: `Your ${userAllergy.pollenName} allergy may be affected by current ${plant.displayName} levels.`,
          inSeason: plant.inSeason,
          plantDescription: plant.plantDescription,
        })
      }
    }
  }

  return personalizedRisks
}

function getPersonalizedRiskLevel(pollenIndex: number, userSeverity: string) {
  // Adjust risk based on user's allergy severity
  const severityMultiplier = {
    mild: 1,
    moderate: 1.5,
    severe: 2,
  }

  const key = userSeverity.toLowerCase() as keyof typeof severityMultiplier
  const adjustedRisk = pollenIndex * (severityMultiplier[key] ?? 1)

  if (adjustedRisk <= 2) return 'Low'
  if (adjustedRisk <= 4) return 'Moderate'
  if (adjustedRisk <= 6) return 'High'
  return 'Very High'
}

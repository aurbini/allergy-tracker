import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { allergies, users } from '@/db/schema'
import { authOptions } from '@/lib/authOptions'

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

    // Call Google Pollen API
    // TODO: Using test coordinates that have rich data
    const pollenData = await fetchPollenData('32.32', '35.32')

    // Match user allergies with current pollen data
    const personalizedRisk = matchAllergiesWithPollen(userAllergies, pollenData)

    return NextResponse.json({
      pollenData,
      personalizedRisk,
      userAllergies: userAllergies.length,
    })
  } catch (error) {
    console.error('Error fetching pollen data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pollen data' },
      { status: 500 }
    )
  }
}

async function fetchPollenData(latitude: string, longitude: string) {
  const apiKey = process.env.GOOGLE_POLLEN_API_KEY

  if (!apiKey) {
    throw new Error('Google Pollen API key not configured')
  }

  // Google Pollen API call with correct parameters
  const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.longitude=${longitude}&location.latitude=${latitude}&days=1`

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
  console.log('API Response:', JSON.stringify(data, null, 2)) // Debug log
  return data
}

function matchAllergiesWithPollen(userAllergies: any[], pollenData: any) {
  const personalizedRisks: {
    type: string
    name: any
    userAllergy: any
    severity: any
    currentIndex: any
    category: any
    riskLevel: string
    recommendation: any
    inSeason: any
    plantDescription?: any
  }[] = []

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
          type: 'pollen',
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
          type: 'plant',
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

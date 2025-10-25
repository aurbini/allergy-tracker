import { getCached, setCached } from './cache'
import { rateLimit } from './rate-limit'

export interface LocationData {
  city: string
  state: string
  country: string
  latitude?: number
  longitude?: number
}

export async function getCoordinates(
  city: string,
  state: string,
  country: string,
  userIdentifier?: string
): Promise<{ latitude: number; longitude: number } | null> {
  // Create cache key
  const cacheKey = `coords:${city.toLowerCase()}:${state.toLowerCase()}:${country.toLowerCase()}`

  // Check cache first
  const cached = getCached<{ latitude: number; longitude: number }>(cacheKey)
  if (cached) {
    console.log('Using cached coordinates for', city, state, country)
    return cached
  }

  // Rate limiting (if user identifier provided)
  if (userIdentifier && !rateLimit(`geocoding:${userIdentifier}`, 5, 60000)) {
    console.warn('Rate limit exceeded for geocoding requests')
    return getDefaultCoordinates(city, state, country)
  }

  try {
    // Check if API key is available
    if (
      !process.env.OPENWEATHER_API_KEY ||
      process.env.OPENWEATHER_API_KEY === 'demo'
    ) {
      console.warn('No API key configured, using default coordinates')
      return getDefaultCoordinates(city, state, country)
    }

    const query = `${city}, ${state}, ${country}`.replace(/\s+/g, '+')
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`,
      {
        headers: {
          'User-Agent': 'AllergyTracker/1.0',
        },
      }
    )

    if (!response.ok) {
      console.warn('Geocoding service unavailable, using default coordinates')
      return getDefaultCoordinates(city, state, country)
    }

    const data = await response.json()
    if (data && data.length > 0) {
      const coordinates = {
        latitude: data[0].lat,
        longitude: data[0].lon,
      }

      // Cache the result for 24 hours
      setCached(cacheKey, coordinates, 24 * 60 * 60 * 1000)

      return coordinates
    }

    return getDefaultCoordinates(city, state, country)
  } catch (error) {
    console.warn('Failed to get coordinates:', error)
    return getDefaultCoordinates(city, state, country)
  }
}

// Fallback coordinates for major cities (no API calls needed)
function getDefaultCoordinates(
  city: string,
  state: string,
  country: string
): { latitude: number; longitude: number } | null {
  const defaultCoords: Record<string, { lat: number; lng: number }> = {
    'new york': { lat: 40.7128, lng: -74.006 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    chicago: { lat: 41.8781, lng: -87.6298 },
    houston: { lat: 29.7604, lng: -95.3698 },
    phoenix: { lat: 33.4484, lng: -112.074 },
    philadelphia: { lat: 39.9526, lng: -75.1652 },
    'san antonio': { lat: 29.4241, lng: -98.4936 },
    'san diego': { lat: 32.7157, lng: -117.1611 },
    dallas: { lat: 32.7767, lng: -96.797 },
    'san jose': { lat: 37.3382, lng: -121.8863 },
    london: { lat: 51.5074, lng: -0.1278 },
    paris: { lat: 48.8566, lng: 2.3522 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    toronto: { lat: 43.6532, lng: -79.3832 },
    sydney: { lat: -33.8688, lng: 151.2093 },
  }

  const key = city.toLowerCase()
  const coords = defaultCoords[key]

  if (coords) {
    console.log('Using default coordinates for', city)
    return { latitude: coords.lat, longitude: coords.lng }
  }

  // Return null if no default coordinates available
  console.warn('No coordinates available for', city, state, country)
  return null
}

export function formatLocation(
  city: string,
  state: string,
  country: string
): string {
  return `${city}, ${state}, ${country}`
}

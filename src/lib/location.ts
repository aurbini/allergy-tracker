import { getCached, setCached } from './cache'
import { rateLimit } from './rate-limit'

export interface LocationData {
  city: string
  state: string
  country: string
  latitude?: number
  longitude?: number
}

/**
 * Get coordinates for a location using a multi-tier fallback strategy:
 * 1. Try OpenWeatherMap Geocoding API
 * 2. If that fails, try Google Geocoding API
 * 3. If that fails, use built-in city database
 * 4. If that fails, use state-based fallbacks
 * 5. Final fallback: geographic center of US
 */
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

    // Try multiple query formats for better results
    const queries = [`${city}, ${state}, ${country}`, `${city}, ${state}`, city]

    let response: Response | null = null
    let data: any[] = []

    for (const query of queries) {
      const encodedQuery = query.replace(/\s+/g, '+')
      try {
        console.log(
          'Fetching coordinates for:',
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
        )
        response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`,
          {
            headers: {
              'User-Agent': 'AllergyTracker/1.0',
            },
          }
        )

        if (response.ok) {
          data = await response.json()
          if (data && data.length > 0) {
            break // Found results, stop trying other queries
          }
        }
      } catch (error) {
        console.warn(`Geocoding query failed for "${query}":`, error)
        continue
      }
    }

    if (!response || !response.ok) {
      console.warn('Geocoding service unavailable, using default coordinates')
      return getDefaultCoordinates(city, state, country)
    }

    if (data && data.length > 0) {
      const coordinates = {
        latitude: data[0].lat,
        longitude: data[0].lon,
      }

      // Cache the result for 24 hours
      setCached(cacheKey, coordinates, 24 * 60 * 60 * 1000)
      console.log('Successfully geocoded:', city, state, coordinates)

      return coordinates
    }

    console.warn('No geocoding results found, trying Google Geocoding API')
    return await tryGoogleGeocoding(city, state, country, cacheKey)
  } catch (error) {
    console.warn(
      'OpenWeatherMap geocoding failed, trying Google Geocoding:',
      error
    )
    return await tryGoogleGeocoding(city, state, country, cacheKey)
  }
}

// Google Geocoding API fallback
async function tryGoogleGeocoding(
  city: string,
  state: string,
  country: string,
  cacheKey: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Check if Google API key is available
    if (
      !process.env.GOOGLE_GEOCODING_API_KEY ||
      process.env.GOOGLE_GEOCODING_API_KEY === 'demo'
    ) {
      console.warn(
        'No Google Geocoding API key configured, using default coordinates'
      )
      return getDefaultCoordinates(city, state, country)
    }

    // Try multiple query formats for Google Geocoding
    const queries = [`${city}, ${state}, ${country}`, `${city}, ${state}`, city]

    for (const query of queries) {
      const encodedQuery = encodeURIComponent(query)
      console.log('Trying Google Geocoding for:', query)

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`,
          {
            headers: {
              'User-Agent': 'AllergyTracker/1.0',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()

          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location
            const coordinates = {
              latitude: location.lat,
              longitude: location.lng,
            }

            // Cache the result for 24 hours
            setCached(cacheKey, coordinates, 24 * 60 * 60 * 1000)
            console.log(
              'Successfully geocoded with Google:',
              city,
              state,
              coordinates
            )

            return coordinates
          } else {
            console.warn(
              `Google Geocoding failed for "${query}":`,
              data.status,
              data.error_message
            )
          }
        } else {
          console.warn(
            `Google Geocoding API error for "${query}":`,
            response.status
          )
        }
      } catch (error) {
        console.warn(`Google Geocoding request failed for "${query}":`, error)
        continue
      }
    }

    console.warn(
      'Google Geocoding failed for all queries, using default coordinates'
    )
    return getDefaultCoordinates(city, state, country)
  } catch (error) {
    console.warn('Google Geocoding failed:', error)
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
    // Major US Cities
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

    // Florida Cities
    miami: { lat: 25.7617, lng: -80.1918 },
    'boca raton': { lat: 26.3683, lng: -80.1289 },
    'west palm beach': { lat: 26.7153, lng: -80.0534 },
    orlando: { lat: 28.5383, lng: -81.3792 },
    tampa: { lat: 27.9506, lng: -82.4572 },
    jacksonville: { lat: 30.3322, lng: -81.6557 },
    tallahassee: { lat: 30.4518, lng: -84.2807 },
    'fort lauderdale': { lat: 26.1224, lng: -80.1373 },

    // Other Major US Cities
    atlanta: { lat: 33.749, lng: -84.388 },
    boston: { lat: 42.3601, lng: -71.0589 },
    denver: { lat: 39.7392, lng: -104.9903 },
    detroit: { lat: 42.3314, lng: -83.0458 },
    'las vegas': { lat: 36.1699, lng: -115.1398 },
    nashville: { lat: 36.1627, lng: -86.7816 },
    portland: { lat: 45.5152, lng: -122.6784 },
    seattle: { lat: 47.6062, lng: -122.3321 },
    washington: { lat: 38.9072, lng: -77.0369 },

    // International Cities
    london: { lat: 51.5074, lng: -0.1278 },
    paris: { lat: 48.8566, lng: 2.3522 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    toronto: { lat: 43.6532, lng: -79.3832 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    grasse: { lat: 43.6604, lng: 6.9206 }, // Grasse, France
    berlin: { lat: 52.52, lng: 13.405 },
    madrid: { lat: 40.4168, lng: -3.7038 },
    rome: { lat: 41.9028, lng: 12.4964 },
    vancouver: { lat: 49.2827, lng: -123.1207 },
    melbourne: { lat: -37.8136, lng: 144.9631 },
  }

  // Try exact city match first
  const key = city.toLowerCase().trim()
  let coords = defaultCoords[key]

  // If no exact match, try partial matches for common patterns
  if (!coords) {
    // Handle "City, State" format
    const cityOnly = key.split(',')[0].trim()
    coords = defaultCoords[cityOnly]
  }

  // Try state-based fallback for major cities
  if (!coords && state) {
    const stateKey = state.toLowerCase().trim()
    const stateFallbacks: Record<string, { lat: number; lng: number }> = {
      florida: { lat: 28.5383, lng: -81.3792 }, // Orlando
      california: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      texas: { lat: 29.7604, lng: -95.3698 }, // Houston
      'new york': { lat: 40.7128, lng: -74.006 }, // New York City
      illinois: { lat: 41.8781, lng: -87.6298 }, // Chicago
    }
    coords = stateFallbacks[stateKey]
  }

  if (coords) {
    console.log('Using default coordinates for', city, state)
    return { latitude: coords.lat, longitude: coords.lng }
  }

  // Final fallback - use appropriate location based on country
  console.warn(
    'No coordinates available for',
    city,
    state,
    country,
    '- using fallback'
  )

  // Use country-appropriate fallback coordinates
  const countryLower = country.toLowerCase().trim()

  // Handle cases where country might be duplicated or have extra text
  const isFrance = countryLower.includes('france') || countryLower === 'fr'
  const isGermany = countryLower.includes('germany') || countryLower === 'de'
  const isSpain = countryLower.includes('spain') || countryLower === 'es'
  const isItaly = countryLower.includes('italy') || countryLower === 'it'
  const isUK =
    countryLower.includes('united kingdom') ||
    countryLower.includes('uk') ||
    countryLower === 'gb'
  const isCanada = countryLower.includes('canada') || countryLower === 'ca'
  const isAustralia =
    countryLower.includes('australia') || countryLower === 'au'

  if (isFrance) {
    return { latitude: 46.2276, longitude: 2.2137 } // Geographic center of France
  } else if (isGermany) {
    return { latitude: 51.1657, longitude: 10.4515 } // Geographic center of Germany
  } else if (isSpain) {
    return { latitude: 40.4637, longitude: -3.7492 } // Geographic center of Spain
  } else if (isItaly) {
    return { latitude: 41.8719, longitude: 12.5674 } // Geographic center of Italy
  } else if (isUK) {
    return { latitude: 55.3781, longitude: -3.436 } // Geographic center of UK
  } else if (isCanada) {
    return { latitude: 56.1304, longitude: -106.3468 } // Geographic center of Canada
  } else if (isAustralia) {
    return { latitude: -25.2744, longitude: 133.7751 } // Geographic center of Australia
  } else {
    // Default to US center for unknown countries
    return { latitude: 39.8283, longitude: -98.5795 } // Geographic center of US
  }
}

export function formatLocation(
  city: string,
  state: string,
  country: string
): string {
  return `${city}, ${state}, ${country}`
}

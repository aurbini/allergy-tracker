'use client'

import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Date {
  year: number
  month: number
  day: number
}

interface IndexInfo {
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

interface PlantDescription {
  type: string
  family: string
  season: string
  specialColors: string
  specialShapes: string
  crossReaction: string
  picture: string
  pictureCloseup: string
}

interface PollenTypeInfo {
  code: string
  displayName: string
  inSeason?: boolean
  indexInfo?: IndexInfo
  healthRecommendations?: string[]
}

interface PlantInfo {
  code: string
  displayName: string
  inSeason?: boolean
  indexInfo?: IndexInfo
  plantDescription?: PlantDescription
}

interface DayInfo {
  date: Date
  pollenTypeInfo: PollenTypeInfo[]
  plantInfo: PlantInfo[]
}

interface PollenData {
  regionCode: string
  dailyInfo: DayInfo[]
  nextPageToken?: string
}

interface PersonalizedRisk {
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

export default function PollenWidget() {
  const [pollenData, setPollenData] = useState<PollenData | null>(null)
  const [personalizedRisk, setPersonalizedRisk] = useState<PersonalizedRisk[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPollenData = async () => {
      try {
        const response = await fetch('/api/pollen')
        if (!response.ok) {
          throw new Error('Failed to fetch pollen data')
        }
        const data = await response.json()
        setPollenData(data.pollenData)
        setPersonalizedRisk(data.personalizedRisk || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchPollenData()
  }, [])

  const getRiskColor = (value: number) => {
    if (value <= 2) return 'text-green-600'
    if (value <= 4) return 'text-yellow-600'
    if (value <= 6) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'very low':
        return 'text-green-600'
      case 'low':
        return 'text-green-500'
      case 'moderate':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      case 'very high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Pollen Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading pollen data...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Pollen Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!pollenData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Pollen Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600">No pollen data available.</p>
            <p className="text-sm text-gray-500">
              Make sure your location is set in your profile.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Pollen Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Personalized Risk Alerts */}
          {personalizedRisk.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">
                ⚠️ Your Allergy Risk Today
              </h3>
              <div className="space-y-3">
                {personalizedRisk.map((risk, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      risk.riskLevel === 'Very High'
                        ? 'bg-red-50 border-red-500'
                        : risk.riskLevel === 'High'
                          ? 'bg-orange-50 border-orange-500'
                          : risk.riskLevel === 'Moderate'
                            ? 'bg-yellow-50 border-yellow-500'
                            : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {risk.userAllergy} Allergy Alert
                        </p>
                        <p className="text-sm text-gray-600">
                          Current {risk.name} levels: {risk.currentIndex} (
                          {risk.category})
                        </p>
                        <p className="text-sm text-gray-600">
                          Your severity: {risk.severity} • Risk level:{' '}
                          {risk.riskLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            risk.riskLevel === 'Very High'
                              ? 'bg-red-100 text-red-800'
                              : risk.riskLevel === 'High'
                                ? 'bg-orange-100 text-orange-800'
                                : risk.riskLevel === 'Moderate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {risk.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        {risk.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Region Code */}
          <div>
            <h3 className="font-medium text-gray-900">Region</h3>
            <p className="text-gray-600">{pollenData.regionCode}</p>
          </div>

          {/* Today's Pollen Data */}
          {pollenData.dailyInfo && pollenData.dailyInfo.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Today's Pollen Forecast
              </h3>
              <div className="space-y-3">
                {/* Pollen Types */}
                {pollenData.dailyInfo[0].pollenTypeInfo?.map(
                  (pollen, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium capitalize text-lg">
                            {pollen.code?.replace(/_/g, ' ') || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {pollen.displayName || 'No description'}
                          </p>
                          {pollen.inSeason !== undefined && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                pollen.inSeason
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {pollen.inSeason ? 'In Season' : 'Out of Season'}
                            </span>
                          )}
                        </div>
                        {pollen.indexInfo && (
                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold ${getRiskColor(pollen.indexInfo.value)}`}
                            >
                              {pollen.indexInfo.value}
                            </p>
                            <p
                              className={`text-sm font-medium ${getCategoryColor(pollen.indexInfo.category)}`}
                            >
                              {pollen.indexInfo.category}
                            </p>
                          </div>
                        )}
                      </div>

                      {pollen.indexInfo && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 mb-2">
                            {pollen.indexInfo.indexDescription}
                          </p>
                          {pollen.healthRecommendations &&
                            pollen.healthRecommendations.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-blue-800 mb-1">
                                  Health Recommendation:
                                </p>
                                <p className="text-sm text-blue-700">
                                  {pollen.healthRecommendations[0]}
                                </p>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Plant Types */}
                {pollenData.dailyInfo[0].plantInfo?.map((plant, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium capitalize text-lg">
                          {plant.code?.replace(/_/g, ' ') || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {plant.displayName || 'No description'}
                        </p>
                        {plant.inSeason !== undefined && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              plant.inSeason
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {plant.inSeason ? 'In Season' : 'Out of Season'}
                          </span>
                        )}
                      </div>
                      {plant.indexInfo && (
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${getRiskColor(plant.indexInfo.value)}`}
                          >
                            {plant.indexInfo.value}
                          </p>
                          <p
                            className={`text-sm font-medium ${getCategoryColor(plant.indexInfo.category)}`}
                          >
                            {plant.indexInfo.category}
                          </p>
                        </div>
                      )}
                    </div>

                    {plant.plantDescription && (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Type:
                            </span>
                            <p className="text-gray-600">
                              {plant.plantDescription.type}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Family:
                            </span>
                            <p className="text-gray-600">
                              {plant.plantDescription.family}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Season:
                            </span>
                            <p className="text-gray-600">
                              {plant.plantDescription.season}
                            </p>
                          </div>
                        </div>
                        {plant.plantDescription.crossReaction && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800 mb-1">
                              Cross Reactions:
                            </p>
                            <p className="text-sm text-yellow-700">
                              {plant.plantDescription.crossReaction}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          {pollenData.dailyInfo && pollenData.dailyInfo.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">
                Forecast for: {pollenData.dailyInfo[0].date.year}-
                {pollenData.dailyInfo[0].date.month.toString().padStart(2, '0')}
                -{pollenData.dailyInfo[0].date.day.toString().padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

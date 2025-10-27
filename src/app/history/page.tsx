'use client'

import { useEffect, useState } from 'react'

import Navbar from '@/components/navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Allergy {
  id: number
  type: string
  pollenName: string
  severity: string
  createdAt: string
  updatedAt: string
}

export default function HistoryPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'severity'>('date')

  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const response = await fetch('/api/allergies')
        if (!response.ok) {
          throw new Error('Failed to fetch allergies')
        }
        const data = await response.json()
        setAllergies(data.allergies || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchAllergies()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'severe':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tree':
        return 'bg-blue-100 text-blue-800'
      case 'grass':
        return 'bg-green-100 text-green-800'
      case 'weed':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const sortedAllergies = [...allergies].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'type':
        return a.type.localeCompare(b.type)
      case 'severity':
        const severityOrder = { severe: 3, moderate: 2, mild: 1 }
        return (
          (severityOrder[
            b.severity.toLowerCase() as keyof typeof severityOrder
          ] || 0) -
          (severityOrder[
            a.severity.toLowerCase() as keyof typeof severityOrder
          ] || 0)
        )
      default:
        return 0
    }
  })

  const groupByMonth = (allergies: Allergy[]) => {
    const grouped: { [key: string]: Allergy[] } = {}
    allergies.forEach((allergy) => {
      const month = new Date(allergy.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
      if (!grouped[month]) {
        grouped[month] = []
      }
      grouped[month].push(allergy)
    })
    return grouped
  }

  const groupedAllergies = groupByMonth(sortedAllergies)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Allergy History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                Loading your allergy history...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Allergy History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-red-600">
                Error: {error}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Allergy History
            </h1>
            <p className="text-gray-600">
              View and analyze your allergy data over time.
            </p>
          </div>

          <div className="grid gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {allergies.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Allergies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      allergies.filter(
                        (a) => a.severity.toLowerCase() === 'mild'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Mild Allergies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      allergies.filter(
                        (a) => a.severity.toLowerCase() === 'severe'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Severe Allergies</div>
                </CardContent>
              </Card>
            </div>

            {/* Sort Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Sort & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    onClick={() => setSortBy('date')}
                    size="sm"
                  >
                    By Date
                  </Button>
                  <Button
                    variant={sortBy === 'type' ? 'default' : 'outline'}
                    onClick={() => setSortBy('type')}
                    size="sm"
                  >
                    By Type
                  </Button>
                  <Button
                    variant={sortBy === 'severity' ? 'default' : 'outline'}
                    onClick={() => setSortBy('severity')}
                    size="sm"
                  >
                    By Severity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline View */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedAllergies).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No allergy history found.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedAllergies).map(
                      ([month, monthAllergies]) => (
                        <div key={month}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {month}
                          </h3>
                          <div className="space-y-2">
                            {monthAllergies.map((allergy) => (
                              <div
                                key={allergy.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {allergy.pollenName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {new Date(
                                        allergy.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <Badge className={getTypeColor(allergy.type)}>
                                    {allergy.type}
                                  </Badge>
                                  <Badge
                                    className={getSeverityColor(
                                      allergy.severity
                                    )}
                                  >
                                    {allergy.severity}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

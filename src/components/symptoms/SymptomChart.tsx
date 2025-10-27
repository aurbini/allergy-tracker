'use client'

import { useEffect, useState } from 'react'

import {
  AlertCircle,
  BarChart3,
  Calendar,
  LineChart,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Symptom {
  id: number
  type: string
  severity: string
  notes?: string
  date: string
  createdAt: string
}

interface ChartData {
  date: string
  count: number
  symptoms: string[]
}

export default function SymptomChart() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7') // days
  const [selectedSymptom, setSelectedSymptom] = useState('all')
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  const fetchSymptoms = async () => {
    try {
      const response = await fetch('/api/symptoms')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch symptoms')
      }

      setSymptoms(data.symptoms)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch symptoms')
    } finally {
      setLoading(false)
    }
  }

  const getUniqueSymptomTypes = () => {
    const types = [...new Set(symptoms.map((s) => s.type))]
    return types.map((type) => ({
      value: type,
      label: type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }))
  }

  const getChartData = () => {
    const days = parseInt(selectedPeriod)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Filter symptoms by date range and type
    const filteredSymptoms = symptoms.filter((symptom) => {
      const symptomDate = new Date(symptom.date)
      const isInDateRange = symptomDate >= startDate && symptomDate <= endDate
      const isSelectedType =
        selectedSymptom === 'all' || symptom.type === selectedSymptom
      return isInDateRange && isSelectedType
    })

    // Group by date
    const groupedData: { [key: string]: ChartData } = {}

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      groupedData[dateKey] = {
        date: dateKey,
        count: 0,
        symptoms: [],
      }
    }

    filteredSymptoms.forEach((symptom) => {
      const dateKey = new Date(symptom.date).toISOString().split('T')[0]
      if (groupedData[dateKey]) {
        groupedData[dateKey].count += 1
        groupedData[dateKey].symptoms.push(symptom.type)
      }
    })

    return Object.values(groupedData).reverse()
  }

  const getMaxCount = () => {
    const data = getChartData()
    return Math.max(...data.map((d) => d.count), 1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getSeverityStats = () => {
    const data = getChartData()
    const totalSymptoms = data.reduce((sum, day) => sum + day.count, 0)

    if (totalSymptoms === 0) return null

    const severityCounts = symptoms.reduce(
      (acc, symptom) => {
        const symptomDate = new Date(symptom.date)
        const days = parseInt(selectedPeriod)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - days)

        if (symptomDate >= startDate && symptomDate <= endDate) {
          acc[symptom.severity] = (acc[symptom.severity] || 0) + 1
        }
        return acc
      },
      {} as { [key: string]: number }
    )

    return {
      total: totalSymptoms,
      mild: severityCounts.mild || 0,
      moderate: severityCounts.moderate || 0,
      severe: severityCounts.severe || 0,
    }
  }

  useEffect(() => {
    fetchSymptoms()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Symptom Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Symptom Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = getChartData()
  const maxCount = getMaxCount()
  const severityStats = getSeverityStats()

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Symptom Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Time Period
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Symptom Type
              </label>
              <Select
                value={selectedSymptom}
                onValueChange={setSelectedSymptom}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symptoms</SelectItem>
                  {getUniqueSymptomTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chart Type
              </label>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    chartType === 'bar'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    chartType === 'line'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LineChart className="h-4 w-4" />
                  Line
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardContent className="pt-6">
          {chartData.length === 0 || chartData.every((d) => d.count === 0) ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No symptoms recorded in this period
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chartType === 'bar' ? (
                /* Bar Chart */
                <div className="h-64 flex items-end justify-between gap-2">
                  {chartData.map((day) => (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="w-full flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{
                            height: `${(day.count / maxCount) * 200}px`,
                            minHeight: day.count > 0 ? '4px' : '0px',
                          }}
                          title={`${day.count} symptoms on ${formatDate(day.date)}`}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {day.count}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                        {formatDate(day.date)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Line Chart */
                <div className="h-64 relative">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 200"
                    className="overflow-visible"
                  >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 32}
                        x2="360"
                        y2={40 + i * 32}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Data line */}
                    {chartData.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={chartData
                          .map((day, index) => {
                            const x =
                              40 + (index * 320) / (chartData.length - 1)
                            const y = 200 - 40 - (day.count / maxCount) * 160
                            return `${x},${y}`
                          })
                          .join(' ')}
                      />
                    )}

                    {/* Data points */}
                    {chartData.map((day, index) => {
                      const x = 40 + (index * 320) / (chartData.length - 1)
                      const y = 200 - 40 - (day.count / maxCount) * 160
                      return (
                        <circle
                          key={day.date}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3b82f6"
                          className="hover:r-6 transition-all duration-200 cursor-pointer"
                        >
                          <title>{`${day.count} symptoms on ${formatDate(day.date)}`}</title>
                        </circle>
                      )
                    })}
                  </svg>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
                    {chartData.map((day) => (
                      <div
                        key={day.date}
                        className="text-xs text-gray-600 transform -rotate-45 origin-left"
                        style={{ transformOrigin: 'left center' }}
                      >
                        {formatDate(day.date)}
                      </div>
                    ))}
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-5">
                    {[
                      maxCount,
                      Math.ceil(maxCount * 0.75),
                      Math.ceil(maxCount * 0.5),
                      Math.ceil(maxCount * 0.25),
                      0,
                    ].map((value) => (
                      <div
                        key={value}
                        className="text-xs text-gray-600 text-right pr-2"
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {severityStats && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {severityStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Symptoms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {severityStats.mild}
                </div>
                <div className="text-sm text-gray-600">Mild</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {severityStats.moderate}
                </div>
                <div className="text-sm text-gray-600">Moderate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {severityStats.severe}
                </div>
                <div className="text-sm text-gray-600">Severe</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

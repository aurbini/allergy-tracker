'use client'

import { useEffect, useState } from 'react'

import { AlertCircle, Calendar, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Symptom {
  id: number
  type: string
  severity: string
  notes?: string
  date: string
  createdAt: string
}

export default function SymptomList() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const deleteSymptom = async (id: number) => {
    try {
      const response = await fetch(`/api/symptoms?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete symptom')
      }

      // Remove the symptom from the local state
      setSymptoms(symptoms.filter((symptom) => symptom.id !== id))
      toast.success('Symptom deleted successfully!')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete symptom'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const formatSymptomType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    fetchSymptoms()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading symptoms...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSymptoms} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Symptoms</CardTitle>
      </CardHeader>
      <CardContent>
        {symptoms.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No symptoms recorded yet</p>
            <p className="text-sm text-gray-500">
              Start tracking your symptoms to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {symptoms.slice(0, 10).map((symptom) => (
              <div
                key={symptom.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {formatSymptomType(symptom.type)}
                    </h3>
                    <Badge className={getSeverityColor(symptom.severity)}>
                      {symptom.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(symptom.date)}
                  </div>
                  {symptom.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      {symptom.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSymptom(symptom.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {symptoms.length > 10 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                Showing 10 most recent symptoms
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

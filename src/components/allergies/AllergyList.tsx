'use client'

import { useEffect, useState } from 'react'

import toast from 'react-hot-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import PollenTypeInfo from './PollenTypeInfo'

interface Allergy {
  id: number
  type: string
  pollenName: string
  severity: string
  createdAt: string
}

export default function AllergyList() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

  const handleDelete = async (allergyId: number) => {
    if (!confirm('Are you sure you want to delete this allergy?')) {
      return
    }

    setDeletingId(allergyId)
    try {
      const response = await fetch(`/api/allergies?id=${allergyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete allergy')
      }

      // Remove the allergy from the local state
      setAllergies(allergies.filter((allergy) => allergy.id !== allergyId))
      toast.success('Allergy deleted successfully!')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete allergy'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading your allergies...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (allergies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No allergies recorded yet.</p>
            <p className="text-sm text-gray-500">
              Add your first allergy to start tracking your symptoms.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PollenTypeInfo />
      <Card>
        <CardHeader>
          <CardTitle>Your Allergies ({allergies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {allergy.pollenName}
                    </h3>
                    <Badge className={getTypeColor(allergy.type)}>
                      {allergy.type}
                    </Badge>
                    <Badge className={getSeverityColor(allergy.severity)}>
                      {allergy.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Added on {new Date(allergy.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(allergy.id)}
                  disabled={deletingId === allergy.id}
                >
                  {deletingId === allergy.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

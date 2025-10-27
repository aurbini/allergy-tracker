'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import AllergyForm from '@/components/allergies/AllergyForm'
import AllergyList from '@/components/allergies/AllergyList'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TrackerPage() {
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Allergies
            </h1>
            <p className="text-gray-600">
              Manage your allergy information and track your symptoms over time.
            </p>
          </div>

          <div className="grid gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add New Allergy'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Allergy Form */}
            {showForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Allergy</CardTitle>
                </CardHeader>
                <CardContent>
                  <AllergyForm onSuccess={() => setShowForm(false)} />
                </CardContent>
              </Card>
            )}

            {/* Allergies List */}
            <AllergyList />
          </div>
        </div>
      </div>
    </div>
  )
}

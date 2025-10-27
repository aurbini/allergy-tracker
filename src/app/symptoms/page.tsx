'use client'

import { useState } from 'react'

import { BarChart3, List, Plus } from 'lucide-react'

import Navbar from '@/components/navbar'
import SymptomChart from '@/components/symptoms/SymptomChart'
import SymptomForm from '@/components/symptoms/SymptomForm'
import SymptomList from '@/components/symptoms/SymptomList'
import { Card, CardContent } from '@/components/ui/card'

export default function SymptomsPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'chart'>('add')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSymptomAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const tabs = [
    { id: 'add', label: 'Add Symptom', icon: Plus },
    { id: 'list', label: 'Recent Symptoms', icon: List },
    { id: 'chart', label: 'Trends & Charts', icon: BarChart3 },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Symptom Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Track your daily symptoms and monitor patterns over time.
          </p>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex flex-wrap border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'add' && (
            <div className="max-w-2xl">
              <SymptomForm onSuccess={handleSymptomAdded} />
            </div>
          )}

          {activeTab === 'list' && <SymptomList key={refreshKey} />}

          {activeTab === 'chart' && <SymptomChart key={refreshKey} />}
        </div>
      </div>
    </div>
  )
}

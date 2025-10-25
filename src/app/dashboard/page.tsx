import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Shield } from 'lucide-react'

import AllergyList from '@/components/allergies/AllergyList'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {session.user?.name || 'User'}!
          </h1>
          <p className="text-xl text-gray-600">
            Track your allergies and monitor your health patterns.
          </p>
        </div>

        {/* Main Action Card */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Track Your Allergies</CardTitle>
              <CardDescription className="text-lg">
                Add and manage your personal allergy information to get
                personalized insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/allergies/add">
                <Button size="lg" className="w-full">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Personal Allergy
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Allergies List */}
          <AllergyList />
        </div>
      </div>
    </div>
  )
}

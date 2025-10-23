import { BarChart3, Bell, Shield, Smartphone, Users, Zap } from 'lucide-react'

import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Take Control of Your{' '}
              <span className="text-blue-600">Allergies</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track symptoms, identify triggers, and manage your allergies with
              our comprehensive health monitoring platform. Get insights that
              help you live better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Start Tracking Now</Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Allergies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform helps you track, analyze, and manage
              your allergies effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Symptom Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Log daily symptoms, severity levels, and environmental factors
                  to identify patterns and triggers.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get insights from your data with detailed charts and trends to
                  better understand your allergies.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Smart Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Receive personalized notifications about high pollen days,
                  medication reminders, and symptom patterns.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Mobile App</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access your allergy data anywhere with our intuitive mobile
                  application for iOS and Android.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Family Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share allergy information with family members and healthcare
                  providers for better care coordination.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fast symptom logging, emergency contacts, and quick access to
                  your most important allergy information.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their allergies
            more effectively with AllergyTracker.
          </p>
          <Button size="lg" variant="secondary">
            Get Started Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

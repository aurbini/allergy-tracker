import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import AllergyForm from '@/components/allergies/AllergyForm'

export default async function AddAllergyPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AllergyForm />
    </div>
  )
}

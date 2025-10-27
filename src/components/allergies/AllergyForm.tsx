'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  type AllergyFormData,
  allergySchema,
} from '../../schemas/allergySchema'

// Pollen data supported by Open-Meteo API
const POLLEN_DATA = {
  tree: [
    { code: 'ALDER', name: 'Alder Pollen' },
    { code: 'BIRCH', name: 'Birch Pollen' },
    { code: 'OLIVE', name: 'Olive Pollen' },
  ],
  grass: [{ code: 'GRASS', name: 'Grass Pollen' }],
  weed: [
    { code: 'RAGWEED', name: 'Ragweed Pollen' },
    { code: 'MUGWORT', name: 'Mugwort Pollen' },
  ],
}

interface AllergyFormProps {
  onSuccess?: () => void
}

export default function AllergyForm({ onSuccess }: AllergyFormProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>('')
  const [error, setError] = useState('')

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      type: '',
      pollen: '',
      severity: '',
    },
  })

  const onSubmit = async (data: AllergyFormData) => {
    setError('')
    try {
      const response = await fetch('/api/allergies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: data.type,
          pollen: data.pollen,
          severity: data.severity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save allergy')
      }

      toast.success('Allergy added successfully!')

      // Call onSuccess callback if provided, otherwise redirect to dashboard
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    form.setValue('pollen', '') // Reset pollen selection when type changes
  }

  const availablePollens = selectedType
    ? POLLEN_DATA[selectedType as keyof typeof POLLEN_DATA] || []
    : []

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Add Personal Allergy
        </CardTitle>
        <CardDescription className="text-center">
          Track your specific pollen allergies for personalized insights
        </CardDescription>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Only pollen types with real-time data are
            available. This ensures accurate allergy tracking based on current
            pollen levels.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Allergy Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergy Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleTypeChange(value)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select allergy type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tree">Tree</SelectItem>
                      <SelectItem value="grass">Grass</SelectItem>
                      <SelectItem value="weed">Weed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specific Pollen */}
            <FormField
              control={form.control}
              name="pollen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Pollen</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specific pollen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePollens.map((pollen) => (
                        <SelectItem key={pollen.code} value={pollen.code}>
                          {pollen.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Severity Level */}
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {form.formState.isSubmitting ? 'Adding...' : 'Add Allergy'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

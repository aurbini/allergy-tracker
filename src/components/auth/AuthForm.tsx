'use client'

import { useState } from 'react'

import { signIn } from 'next-auth/react'
import Link from 'next/link'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { registerUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema, signupSchema } from '@/schemas/authSchema'

export type AuthType = 'login' | 'signup'

export default function AuthForm({ type }: { type: AuthType }) {
  const schema = type === 'signup' ? signupSchema : loginSchema

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      type === 'signup'
        ? { name: '', email: '', password: '' }
        : { email: '', password: '' },
  })

  const [error, setError] = useState('')

  const onSubmit = async (data: any) => {
    setError('')
    try {
      if (type === 'signup') {
        await registerUser(data.name, data.email, data.password)
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: '/dashboard',
      })

      if (result?.error) setError(result.error)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto border rounded-xl p-8 shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4">
        {type === 'signup' ? 'Create an Account' : 'Welcome Back'}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          {type === 'signup' && (
            <FormField
              control={form.control}
              name={'name' as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            {form.formState.isSubmitting
              ? 'Please wait...'
              : type === 'signup'
                ? 'Sign Up'
                : 'Login'}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-gray-600 mt-4">
        {type === 'signup' ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

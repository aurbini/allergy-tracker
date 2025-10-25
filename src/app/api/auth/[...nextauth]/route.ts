import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { users } from '@/db/schema'

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)
        const user = userRecord[0]

        if (!user) return null
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isValid) return null

        return { id: user.id.toString(), email: user.email, name: user.name }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler

import CredentialsProvider from 'next-auth/providers/credentials'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { users } from '@/db/schema'

export const authOptions = {
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
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
}

import { withAuth } from 'next-auth/middleware'

export default withAuth({
  // Redirect unauthenticated users to /login
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'], // protected routes
}

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Demo users for testing (in production, use a real database)
const demoUsers = [
  { id: '1', email: 'demo@yiiart.com', password: 'demo123', name: 'Demo User' }
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check demo users first
        const demoUser = demoUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )
        
        if (demoUser) {
          return { id: demoUser.id, email: demoUser.email, name: demoUser.name }
        }

        // In production, check database for user
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

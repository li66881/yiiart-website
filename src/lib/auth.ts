import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const demoLoginEnabled = process.env.DEMO_LOGIN_ENABLED === "true"
const demoUser = {
  id: "demo",
  email: process.env.DEMO_USER_EMAIL,
  password: process.env.DEMO_USER_PASSWORD,
  name: process.env.DEMO_USER_NAME || "Demo User",
}

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

        if (
          demoLoginEnabled &&
          demoUser.email &&
          demoUser.password &&
          credentials.email === demoUser.email &&
          credentials.password === demoUser.password
        ) {
          return { id: demoUser.id, email: demoUser.email, name: demoUser.name }
        }

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
  trustHost: true,
})

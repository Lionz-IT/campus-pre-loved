import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        campus_email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await db.query.profiles.findFirst({
          where: eq(profiles.campus_email, credentials.campus_email as string),
        })

        if (!user) throw new Error("User not found.")

        const isValid = await compare(credentials.password as string, user.password_hash)

        if (!isValid) throw new Error("Invalid password.")

        if (!user.is_verified) throw new Error("Please verify your email.")

        return { id: user.id, email: user.campus_email, name: user.full_name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
})

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

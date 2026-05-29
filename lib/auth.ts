import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        return { id: user.id, email: user.campus_email, name: user.full_name }
      },
    }),
  ],
})

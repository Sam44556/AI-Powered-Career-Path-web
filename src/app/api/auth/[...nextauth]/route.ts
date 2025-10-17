import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id?: string | null;
  }
}

 const authOptions: AuthOptions = {
  providers: [
    // Manual login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials!.password,
          user.password
        );
        if (!valid) return null;

        return user;
      },
    }),

    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Auto-create user if not exists
    async signIn({ user }) {
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name ?? "",
            password: "", // no password for Google users
          },
        });
      }

      // Attach DB id to user (important for session callback)
      user.id = existingUser.id;
      return true;
    },

    // Add id to JWT token
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    // Add id to session
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

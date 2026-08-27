import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production"
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole;
  }
}

export const { handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called for:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          console.log("[AUTH] User not found or no password:", credentials.email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          console.log("[AUTH] Invalid password for:", credentials.email);
          return null;
        }

        console.log("[AUTH] Success:", user.email, "Role:", user.role);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});

/* ================================================================ */
/*  Hilfsfunktionen                                                  */
/* ================================================================ */

export async function createToken(user: {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}): Promise<string> {
  return await new SignJWT({ sub: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

// Custom auth function — liest beide Session-Systeme
export async function auth(): Promise<{ user: { id: string; email: string; name?: string | null; role: string } } | null> {
  try {
    const cookieStore = await cookies();

    // 1. Custom nephro-token (von unserem Custom Login)
    const token = cookieStore.get("nephro-token")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      if (payload.sub && payload.email) {
        return {
          user: {
            id: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string | null | undefined,
            role: payload.role as string,
          },
        };
      }
    }

    // 2. NextAuth Session Cookie (V5: __session, nicht next-auth.session-token bei JWT-Strategy)
    const sessionCookie = cookieStore.get("__session")?.value;
    if (sessionCookie) {
      const { payload } = await jwtVerify(sessionCookie, secret, { clockTolerance: 60 });
      if (payload.sub && payload.email) {
        return {
          user: {
            id: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string | null | undefined,
            role: payload.role as string,
          },
        };
      }
    }

    // 3. Fallback: Datenbank-Lookup per User-Id aus Cookie
    // NextAuth speichert in JWT: sub = user.id
    const nextAuthToken = cookieStore.get("next-auth.session-token")?.value;
    if (nextAuthToken) {
      try {
        const { payload } = await jwtVerify(nextAuthToken, secret, { clockTolerance: 60 });
        if (payload.sub) {
          const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            select: { id: true, email: true, name: true, role: true },
          });
          if (user) {
            return {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              },
            };
          }
        }
      } catch (e) {
        // Token konnte nicht verifiziert werden
      }
    }
  } catch {
    // Invalid token
  }
  return null;
}

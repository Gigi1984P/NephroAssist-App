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

// ================================================================
// NextAuth-Konfiguration
// ================================================================
export const {
  handlers,
  signIn,
  signOut,
  auth: nextAuth,
} = NextAuth({
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
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
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

// ================================================================
// AUTH-Funktion (NextAuth Session + Custom nephro-token Fallback)
// ================================================================
export async function auth(): Promise<{ user: { id: string; email: string; name?: string | null; role: string } } | null> {
  try {
    // 1. Versuche NextAuth's eingebaute auth()
    const session = await nextAuth();
    if (session?.user?.id) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        },
      };
    }
  } catch {
    // NextAuth Session nicht gefunden
  }

  try {
    // 2. Fallback: Custom nephro-token (von /api/login)
    const cookieStore = await cookies();
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
  } catch {
    // Token ungültig
  }

  return null;
}

// Auth mit Request-Header (für API Routes / Edge Cases)
export async function authFromRequest(request: Request): Promise<{ user: { id: string; email: string; name?: string | null; role: string } } | null> {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name) cookies[name] = decodeURIComponent(rest.join("="));
    });

    // NextAuth Session Token
    const sessionToken = cookies["next-auth.session-token"] || cookies["__session"];
    if (sessionToken) {
      const { payload } = await jwtVerify(sessionToken, secret, { clockTolerance: 60 });
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

    // Custom nephro-token
    const token = cookies["nephro-token"];
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
  } catch {
    // Token ungültig
  }
  return null;
}

// ================================================================
// Hilfsfunktionen
// ================================================================
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

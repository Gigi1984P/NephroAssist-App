import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@prisma/client";

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

// Hilfsfunktion: Cookie-Header parsen
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) cookies[name] = decodeURIComponent(rest.join("="));
  });
  return cookies;
}

// Custom auth function — liest Session aus Request-Cookies
export async function auth(): Promise<{ user: { id: string; email: string; name?: string | null; role: string } } | null> {
  try {
    // Versuche cookies() aus next/headers (Next.js App Router)
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    // 1. Custom nephro-token
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

    // 2. NextAuth session-token
    const sessionToken = cookieStore.get("__session")?.value ||
                          cookieStore.get("next-auth.session-token")?.value;
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
  } catch {
    // cookies() nicht verfügbar oder fehlgeschlagen — Fallback
  }

  return null;
}

// Auth mit Request-Header (für Middleware / Edge Cases)
export async function authFromRequest(request: Request): Promise<{ user: { id: string; email: string; name?: string | null; role: string } } | null> {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = parseCookies(cookieHeader);

    // 1. Custom nephro-token
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

    // 2. NextAuth session-token
    const sessionToken = cookies["__session"] || cookies["next-auth.session-token"];
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
  } catch {
    // Token ungültig
  }
  return null;
}

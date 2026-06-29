/**
 * Конфигурация NextAuth: вход по email/паролю, JWT-сессия и колбэки
 * для перенаправления и синхронизации полей пользователя в токене.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getAuthBaseUrl } from "@/lib/auth-url";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const authBaseUrl = getAuthBaseUrl();
const isProduction = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        // Нет учётных данных — отказ входа
        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        // Пользователь без пароля (OAuth-only и т.п.)
        if (!user?.passwordHash) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.displayName,
          image: user.avatar,
          role: user.role,
          displayName: user.displayName,
          avatar: user.avatar,
          city: user.city,
        };
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      const canonicalBase = authBaseUrl ?? baseUrl.replace(/\/$/, "");
      // Относительный путь — дополняем baseUrl
      if (url.startsWith("/")) return `${canonicalBase}${url}`;
      try {
        const target = new URL(url);
        const base = new URL(canonicalBase);
        if (target.origin === base.origin) return url;
      } catch {
        /* ignore */
      }
      return `${canonicalBase}/profile`;
    },
    async jwt({ token, user, trigger, session }) {
      // Первый вход: копируем поля из user в JWT
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.displayName = user.displayName;
        token.avatar = user.avatar;
        token.city = user.city;
      }
      // Обновление сессии с клиента
      if (trigger === "update" && session?.user) {
        if (session.user.avatar) token.avatar = session.user.avatar;
        if (session.user.displayName) token.displayName = session.user.displayName;
        if (session.user.city !== undefined) token.city = session.user.city;
      }
      // Обновление без avatar в session — подтягиваем из БД
      if (trigger === "update" && token.id && !session?.user?.avatar) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.avatar = dbUser.avatar;
          token.displayName = dbUser.displayName;
          token.city = dbUser.city;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.displayName = token.displayName;
        session.user.avatar = token.avatar;
        session.user.city = token.city;
        session.user.name = token.displayName;
        session.user.image = token.avatar;
      }
      return session;
    },
  },
});

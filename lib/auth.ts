import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyOtp } from "./otp";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    // Email + password
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    // Phone number + SMS OTP (call /api/auth/phone/send-otp first, then sign in with the code)
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const ok = await verifyOtp(credentials.phone, credentials.code);
        if (!ok) return null;

        let user = await prisma.user.findUnique({ where: { phone: credentials.phone } });
        if (!user) {
          user = await prisma.user.create({
            data: { phone: credentials.phone, name: credentials.phone },
          });
        }

        return { id: user.id, name: user.name, phone: user.phone } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        const dbUser = await prisma.user.findUnique({ where: { id: token.uid as string } });
        (session.user as any).username = dbUser?.username ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

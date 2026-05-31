import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import { organization } from "better-auth/plugins";
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 8003}`,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 8003}`,
    process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 8003}`,
  ],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // In production with SMTP configured, send email
      // For now, log to console for development
      console.log(`\n=== EMAIL VERIFICATION ===`);
      console.log(`To: ${user.email}`);
      console.log(`Verification URL: ${url}`);
      console.log(`========================\n`);
    },
  },
});

export type Session = typeof auth.$Infer.Session;

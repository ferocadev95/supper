import NextAuth, { CredentialsSignin } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestore } from "./firebaseAdmin";
import { credentialsSchema } from "./src/lib/auth/schemas";
import { getUserByEmail } from "./src/lib/auth/users";
import { verifyPassword } from "./src/lib/auth/password";

// Error específico para cuentas cuyo correo aún no ha sido verificado.
class EmailNotVerifiedError extends CredentialsSignin {
  code = "EmailNotVerified";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await getUserByEmail(email);

        // Sin usuario o sin contraseña (p. ej. cuenta creada con Google):
        // credenciales inválidas, mensaje genérico.
        if (!user?.hashedPassword) return null;

        const valid = await verifyPassword(password, user.hashedPassword);
        if (!valid) return null;

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return { id: user.id, name: user.name ?? null, email: user.email };
      },
    }),
  ],
  adapter: FirestoreAdapter(firestore),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

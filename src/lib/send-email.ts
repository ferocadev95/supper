import getResend from "./getResend";
import { VerifyEmailTemplate } from "../components/emails/VerifyEmailTemplate";
import { ResetPasswordTemplate } from "../components/emails/ResetPasswordTemplate";

// Remitente configurable. En dev, sin dominio verificado en Resend, usa
// EMAIL_FROM="onboarding@resend.dev" (solo envía a tu propio correo de Resend).
const FROM = process.env.EMAIL_FROM || "no-reply@registrosupper.store";

// URL base de la app para construir los enlaces de los correos.
function baseUrl(): string {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

// Fuera de producción imprime el enlace en consola para poder probar sin correo.
function logLinkInDev(label: string, url: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[DEV] ${label}:\n${url}\n`);
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const resend = getResend();
  const verifyUrl = `${baseUrl()}/verify-email?token=${token}`;
  logLinkInDev("Enlace de verificación", verifyUrl);

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verifica tu cuenta - Supper",
    react: VerifyEmailTemplate({ verifyUrl }),
  });

  if (error) {
    console.error("Error enviando correo de verificación:", error);
    throw new Error("No se pudo enviar el correo de verificación");
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resend = getResend();
  const resetUrl = `${baseUrl()}/reset-password?token=${token}`;
  logLinkInDev("Enlace de restablecimiento", resetUrl);

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablecer contraseña - Supper",
    react: ResetPasswordTemplate({ resetUrl }),
  });

  if (error) {
    console.error("Error enviando correo de restablecimiento:", error);
    throw new Error("No se pudo enviar el correo de restablecimiento");
  }
}

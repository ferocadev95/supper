import getResend from "./getResend";
import { VerifyEmailTemplate } from "../components/emails/VerifyEmailTemplate";
import { ResetPasswordTemplate } from "../components/emails/ResetPasswordTemplate";
import {
  OrderConfirmationTemplate,
  type OrderConfirmationTemplateProps,
} from "../components/emails/OrderConfirmationTemplate";
import { formatDeliveryDate } from "./delivery";

// Remitente configurable. En dev, sin dominio verificado en Resend, usa
// EMAIL_FROM="onboarding@resend.dev" (solo envía a tu propio correo de Resend).
const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

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
    subject: "Verifica tu cuenta - Frutivida",
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
    subject: "Restablecer contraseña - Frutivida",
    react: ResetPasswordTemplate({ resetUrl }),
  });

  if (error) {
    console.error("Error enviando correo de restablecimiento:", error);
    throw new Error("No se pudo enviar el correo de restablecimiento");
  }
}

// Copia interna de cada pedido. Sin la variable definida sólo se avisa al
// cliente, así que en desarrollo no hace falta configurar nada.
const ORDER_NOTIFICATIONS_EMAIL = process.env.ORDER_NOTIFICATIONS_EMAIL;

interface OrderConfirmationArgs extends OrderConfirmationTemplateProps {
  to: string;
}

/**
 * Confirmación del pedido con su detalle y su fecha de entrega.
 *
 * Quien llama decide qué hacer con el fallo: el pedido ya está cobrado y
 * guardado cuando esto se ejecuta, así que un error de Resend no debe
 * deshacerlo.
 */
export async function sendOrderConfirmationEmail({
  to,
  ...order
}: OrderConfirmationArgs): Promise<void> {
  const resend = getResend();

  const when = order.deliveryDate
    ? ` · entrega ${formatDeliveryDate(order.deliveryDate)}`
    : "";

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    // La copia va en bcc para que el cliente no vea el correo interno.
    ...(ORDER_NOTIFICATIONS_EMAIL ? { bcc: [ORDER_NOTIFICATIONS_EMAIL] } : {}),
    subject: `Confirmación de tu pedido - Frutivida${when}`,
    react: OrderConfirmationTemplate(order),
  });

  if (error) {
    console.error("Error enviando la confirmación del pedido:", error);
    throw new Error("No se pudo enviar la confirmación del pedido");
  }
}

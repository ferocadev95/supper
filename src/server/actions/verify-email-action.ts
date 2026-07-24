"use server";

import { consumeEmailVerificationToken } from "../../lib/auth/token-store";
import { markEmailVerified } from "../../lib/auth/users";

export type VerifyEmailResult = { ok: boolean; message: string };

// Valida el token del enlace y marca el correo como verificado.
export const verifyEmail = async (
  token: string | undefined,
): Promise<VerifyEmailResult> => {
  if (!token) {
    return { ok: false, message: "Enlace de verificación inválido." };
  }

  try {
    const data = await consumeEmailVerificationToken(token);
    if (!data) {
      return {
        ok: false,
        message:
          "El enlace de verificación es inválido o expiró. Solicita uno nuevo.",
      };
    }

    await markEmailVerified(data.userId);
    return {
      ok: true,
      message: "¡Tu cuenta fue verificada! Ya puedes iniciar sesión.",
    };
  } catch (error) {
    console.error("Error verificando el correo:", error);
    return {
      ok: false,
      message: "Hubo un problema al verificar tu cuenta. Intenta de nuevo.",
    };
  }
};

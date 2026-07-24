"use server";

import { requestResetSchema } from "../../lib/auth/schemas";
import { getUserByEmail } from "../../lib/auth/users";
import { createEmailVerificationToken } from "../../lib/auth/token-store";
import { sendVerificationEmail } from "../../lib/send-email";
import { AuthActionState } from "./auth-state";

// Mensaje genérico (anti-enumeración): se responde igual exista o no la cuenta.
const GENERIC_SUCCESS =
  "Si tu cuenta existe y aún no está verificada, te enviamos un nuevo correo de verificación.";

export const resendVerification = async (
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const validated = requestResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: "",
      error: validated.error.issues[0]?.message || "Correo inválido",
    };
  }

  const { email } = validated.data;

  try {
    const user = await getUserByEmail(email);

    // Solo si existe, usa contraseña y todavía no está verificada.
    if (user?.hashedPassword && !user.emailVerified) {
      const token = await createEmailVerificationToken(user.id, user.email);
      await sendVerificationEmail(user.email, token);
    }
  } catch (error) {
    console.error("Error reenviando verificación:", error);
  }

  return { success: GENERIC_SUCCESS, error: "" };
};

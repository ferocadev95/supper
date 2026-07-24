"use server";

import { requestResetSchema } from "../../lib/auth/schemas";
import { getUserByEmail } from "../../lib/auth/users";
import { createPasswordResetToken } from "../../lib/auth/token-store";
import { sendPasswordResetEmail } from "../../lib/send-email";
import { AuthActionState } from "./auth-state";

// Mensaje genérico: se devuelve exista o no la cuenta, para no revelar qué
// correos están registrados (protección contra enumeración de usuarios).
const GENERIC_SUCCESS =
  "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.";

export const requestPasswordReset = async (
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

    // Solo enviamos el correo si la cuenta existe y usa contraseña.
    if (user?.hashedPassword) {
      const token = await createPasswordResetToken(user.id, user.email);
      await sendPasswordResetEmail(user.email, token);
    }
  } catch (error) {
    // No filtramos el fallo al cliente; log interno.
    console.error("Error solicitando restablecimiento:", error);
  }

  return { success: GENERIC_SUCCESS, error: "" };
};

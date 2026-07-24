"use server";

import { resetPasswordSchema } from "../../lib/auth/schemas";
import { consumePasswordResetToken } from "../../lib/auth/token-store";
import { setUserPassword } from "../../lib/auth/users";
import { hashPassword } from "../../lib/auth/password";
import { AuthActionState } from "./auth-state";

export const resetPassword = async (
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const validated = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return {
      success: "",
      error: validated.error.issues[0]?.message || "Datos inválidos",
    };
  }

  const { token, password } = validated.data;

  try {
    const data = await consumePasswordResetToken(token);
    if (!data) {
      return {
        success: "",
        error:
          "El enlace es inválido o expiró. Solicita uno nuevo desde 'Olvidé mi contraseña'.",
      };
    }

    const hashedPassword = await hashPassword(password);
    await setUserPassword(data.userId, hashedPassword);

    return {
      success: "Tu contraseña fue actualizada. Ya puedes iniciar sesión.",
      error: "",
    };
  } catch (error) {
    console.error("Error restableciendo la contraseña:", error);
    return {
      success: "",
      error: "Hubo un problema al actualizar tu contraseña. Intenta de nuevo.",
    };
  }
};

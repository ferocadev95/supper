"use server";

import { registerSchema } from "../../lib/auth/schemas";
import { getUserByEmail, createUser } from "../../lib/auth/users";
import { hashPassword } from "../../lib/auth/password";
import { createEmailVerificationToken } from "../../lib/auth/token-store";
import { sendVerificationEmail } from "../../lib/send-email";
import { AuthActionState } from "./auth-state";

export const register = async (
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const validated = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return {
      success: "",
      error: validated.error.issues[0]?.message || "Datos inválidos",
    };
  }

  const { name, email, password } = validated.data;

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return {
        success: "",
        error: "Este correo ya está registrado. Inicia sesión.",
      };
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, hashedPassword });

    const token = await createEmailVerificationToken(user.id, user.email);
    await sendVerificationEmail(user.email, token);

    return {
      success:
        "Cuenta creada. Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja de entrada y spam.",
      error: "",
    };
  } catch (error) {
    console.error("Error en el registro:", error);
    return {
      success: "",
      error: "Hubo un problema al crear tu cuenta. Intenta de nuevo.",
    };
  }
};

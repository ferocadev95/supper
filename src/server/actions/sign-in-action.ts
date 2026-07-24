"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../auth";
import { credentialsSchema } from "../../lib/auth/schemas";
import { AuthActionState } from "./auth-state";

export const signInWithCredentials = async (
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const validated = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { success: "", error: "Correo o contraseña incorrectos" };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirectTo: "/",
    });
    // Inalcanzable: un signIn exitoso lanza NEXT_REDIRECT (capturado abajo y
    // relanzado). Mantiene contento a TypeScript sobre el tipo de retorno.
    return { success: "", error: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        const code = (error as { code?: string }).code;
        if (code === "EmailNotVerified") {
          return {
            success: "",
            error:
              "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
          };
        }
        return { success: "", error: "Correo o contraseña incorrectos" };
      }
      return {
        success: "",
        error: "No se pudo iniciar sesión. Intenta de nuevo.",
      };
    }
    // NEXT_REDIRECT (éxito) y cualquier otro error deben propagarse.
    throw error;
  }
};

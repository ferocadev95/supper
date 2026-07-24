// Estado compartido por las server actions de autenticación, consumido con
// `useActionState` en los formularios cliente.
export type AuthActionState = {
  success: string;
  error: string;
};

export const AUTH_ACTION_INITIAL: AuthActionState = {
  success: "",
  error: "",
};

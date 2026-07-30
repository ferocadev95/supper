"use client";

import React, { useActionState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "../server/actions/request-password-reset-action";
import { AUTH_ACTION_INITIAL } from "../server/actions/auth-state";

const ForgotPasswordForm = () => {
    const [state, formAction] = useActionState(
        requestPasswordReset,
        AUTH_ACTION_INITIAL
    );
    const [isPending, startTransition] = useTransition();

    const submitAction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => {
            formAction(formData);
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <h2 className="font-bold text-lg md:text-xl">
                Recupera tu contraseña
            </h2>
            <p className="text-sm text-gray-600">
                Ingresa tu correo y te enviaremos un enlace para crear una nueva
                contraseña.
            </p>
            <form onSubmit={submitAction} className="flex flex-col gap-2">
                <label
                    htmlFor="forgot-email"
                    className="text-sm font-semibold tracking-wide"
                >
                    Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="email"
                    id="forgot-email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="jhon@mail.com"
                />

                {state?.error && <p className="text-red-500">{state.error}</p>}
                {state?.success && (
                    <p className="text-green-500">{state.success}</p>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary px-4 py-3 rounded-full mt-5 disabled:cursor-not-allowed"
                >
                    {isPending ? "Enviando..." : "Enviar enlace"}
                </button>
            </form>

            <p className="text-sm mt-1">
                <Link href="/sign-in" className="text-primaryGreen hover:underline">
                    Volver a iniciar sesión
                </Link>
            </p>
        </div>
    );
};

export default ForgotPasswordForm;

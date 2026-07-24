"use client";

import React, { useActionState, useTransition } from "react";
import Link from "next/link";
import { resendVerification } from "../server/actions/resend-verification-action";
import { AUTH_ACTION_INITIAL } from "../server/actions/auth-state";

const ResendVerificationForm = () => {
    const [state, formAction] = useActionState(
        resendVerification,
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
                Reenviar verificación
            </h2>
            <p className="text-sm text-gray-600">
                ¿No recibiste el correo? Ingresa tu email y te enviamos un nuevo
                enlace de verificación.
            </p>
            <form onSubmit={submitAction} className="flex flex-col gap-2">
                <label
                    htmlFor="resend-email"
                    className="text-sm font-semibold tracking-wide"
                >
                    Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="email"
                    id="resend-email"
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
                    className="bg-primaryRed hover:bg-red-400 hoverEffect px-4 py-3 rounded-full text-white font-semibold mt-5 disabled:bg-primaryRed/80 disabled:cursor-not-allowed"
                >
                    {isPending ? "Enviando..." : "Reenviar correo"}
                </button>
            </form>

            <p className="text-sm mt-1">
                <Link href="/sign-in" className="text-primaryBlue hover:underline">
                    Volver a iniciar sesión
                </Link>
            </p>
        </div>
    );
};

export default ResendVerificationForm;

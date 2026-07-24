"use client";

import React, { useActionState, useTransition } from "react";
import Link from "next/link";
import { signInWithCredentials } from "../server/actions/sign-in-action";
import { AUTH_ACTION_INITIAL } from "../server/actions/auth-state";

const CredentialsSignInForm = () => {
    const [state, formAction] = useActionState(
        signInWithCredentials,
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
        <div className="flex flex-col gap-3 mt-5">
            <h2 className="font-bold text-lg md:text-xl">
                Inicia sesión con tu correo
            </h2>
            <form onSubmit={submitAction} className="flex flex-col gap-2">
                <label
                    htmlFor="signin-email"
                    className="text-sm font-semibold tracking-wide"
                >
                    Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="email"
                    id="signin-email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="jhon@mail.com"
                />

                <label
                    htmlFor="signin-password"
                    className="text-sm font-semibold tracking-wide mt-2"
                >
                    Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="password"
                    id="signin-password"
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                />

                {state?.error && (
                    <div>
                        <p className="text-red-500">{state.error}</p>
                        {state.error.includes("verificar") && (
                            <Link
                                href="/resend-verification"
                                className="text-primaryBlue hover:underline text-sm"
                            >
                                Reenviar correo de verificación
                            </Link>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-primaryRed hover:bg-red-400 hoverEffect px-4 py-3 rounded-full text-white font-semibold mt-5 disabled:bg-primaryRed/80 disabled:cursor-not-allowed"
                >
                    {isPending ? "Iniciando..." : "Iniciar sesión"}
                </button>
            </form>

            <div className="flex justify-between text-sm mt-1">
                <Link
                    href="/forgot-password"
                    className="text-primaryBlue hover:underline"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
                <Link href="/sign-up" className="text-primaryBlue hover:underline">
                    Crear cuenta
                </Link>
            </div>
        </div>
    );
};

export default CredentialsSignInForm;

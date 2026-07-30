"use client";

import React, { useActionState, useTransition } from "react";
import Link from "next/link";
import { register } from "../server/actions/register-action";
import { AUTH_ACTION_INITIAL } from "../server/actions/auth-state";

const SignUpForm = () => {
    const [state, formAction] = useActionState(register, AUTH_ACTION_INITIAL);
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
            <h2 className="font-bold text-lg md:text-xl">Crea tu cuenta</h2>
            <form onSubmit={submitAction} className="flex flex-col gap-2">
                <label
                    htmlFor="signup-name"
                    className="text-sm font-semibold tracking-wide"
                >
                    Nombre <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="text"
                    id="signup-name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Tu nombre"
                />

                <label
                    htmlFor="signup-email"
                    className="text-sm font-semibold tracking-wide mt-2"
                >
                    Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="email"
                    id="signup-email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="jhon@mail.com"
                />

                <label
                    htmlFor="signup-password"
                    className="text-sm font-semibold tracking-wide mt-2"
                >
                    Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="password"
                    id="signup-password"
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                <p className="text-xs text-gray-500">
                    Mínimo 8 caracteres, con mayúscula, minúscula y número.
                </p>

                <label
                    htmlFor="signup-confirm"
                    className="text-sm font-semibold tracking-wide mt-2"
                >
                    Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <input
                    className="rounded-md px-3 py-3 placeholder:text-gray-300"
                    type="password"
                    id="signup-confirm"
                    name="confirmPassword"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                />

                {state?.error && <p className="text-red-500">{state.error}</p>}
                {state?.success && (
                    <p className="text-green-500">{state.success}</p>
                )}

                <button
                    type="submit"
                    disabled={isPending || !!state?.success}
                    className="btn-primary px-4 py-3 rounded-full mt-5 disabled:cursor-not-allowed"
                >
                    {isPending ? "Creando cuenta..." : "Registrarme"}
                </button>
            </form>

            <p className="text-sm mt-1">
                ¿Ya tienes cuenta?{" "}
                <Link href="/sign-in" className="text-primaryGreen hover:underline">
                    Inicia sesión
                </Link>
            </p>
        </div>
    );
};

export default SignUpForm;

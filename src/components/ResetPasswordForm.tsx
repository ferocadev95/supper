"use client";

import React, { useActionState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "../server/actions/reset-password-action";
import { AUTH_ACTION_INITIAL } from "../server/actions/auth-state";

interface ResetPasswordFormProps {
    token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const [state, formAction] = useActionState(
        resetPassword,
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
            <h2 className="font-bold text-lg md:text-xl">Nueva contraseña</h2>

            {state?.success ? (
                <>
                    <p className="text-green-500">{state.success}</p>
                    <Link
                        href="/sign-in"
                        className="bg-primaryRed hover:bg-red-400 hoverEffect px-4 py-3 rounded-full text-white font-semibold mt-2 text-center"
                    >
                        Iniciar sesión
                    </Link>
                </>
            ) : (
                <form onSubmit={submitAction} className="flex flex-col gap-2">
                    <input type="hidden" name="token" value={token} />

                    <label
                        htmlFor="reset-password"
                        className="text-sm font-semibold tracking-wide"
                    >
                        Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="rounded-md px-3 py-3 placeholder:text-gray-300"
                        type="password"
                        id="reset-password"
                        name="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500">
                        Mínimo 8 caracteres, con mayúscula, minúscula y número.
                    </p>

                    <label
                        htmlFor="reset-confirm"
                        className="text-sm font-semibold tracking-wide mt-2"
                    >
                        Confirmar contraseña{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="rounded-md px-3 py-3 placeholder:text-gray-300"
                        type="password"
                        id="reset-confirm"
                        name="confirmPassword"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />

                    {state?.error && (
                        <p className="text-red-500">{state.error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primaryRed hover:bg-red-400 hoverEffect px-4 py-3 rounded-full text-white font-semibold mt-5 disabled:bg-primaryRed/80 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Guardando..." : "Cambiar contraseña"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ResetPasswordForm;

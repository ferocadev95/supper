"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const CredentialsSignInForm = () => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    const submitAction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        startTransition(async () => {
            setError("");
            // Login en cliente: actualiza el SessionProvider al instante para que
            // el Header (useSession) refleje la sesión sin recargar la página.
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                if (res.code === "EmailNotVerified") {
                    setError(
                        "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada."
                    );
                } else {
                    setError("Correo o contraseña incorrectos");
                }
                return;
            }

            // Éxito: navega al inicio y refresca los server components (layout).
            router.push("/");
            router.refresh();
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

                {error && (
                    <div>
                        <p className="text-red-500">{error}</p>
                        {error.includes("verificar") && (
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

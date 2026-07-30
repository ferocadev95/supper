import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
    title: "Frutivida",
    description: "Tienda online de frutas, verduras y abarrotes.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}

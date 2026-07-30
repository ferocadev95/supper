import React from "react";

export const Table = ({ children }: React.PropsWithChildren) => (
    <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
);

export const TableHeader = ({ children }: React.PropsWithChildren) => (
    <thead>{children}</thead>
);

export const TableBody = ({ children }: React.PropsWithChildren) => (
    <tbody>{children}</tbody>
);

export const TableRow = ({ children }: React.PropsWithChildren) => (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        {children}
    </tr>
);

export const TableHead = ({
    children,
    className,
}: React.PropsWithChildren<{ className?: string }>) => (
    <th
        className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    >
        {children}
    </th>
);

export const TableCell = ({
    children,
    className,
}: React.PropsWithChildren<{ className?: string }>) => (
    <td
        className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    >
        {children}
    </td>
);

export const Card = ({
    children,
    className,
}: React.PropsWithChildren<{ className?: string }>) => (
    <div className={`rounded-2xl border shadow-sm ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ children }: React.PropsWithChildren) => (
    <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

export const CardTitle = ({ children }: React.PropsWithChildren) => (
    <h3 className="text-2xl font-semibold leading-none tracking tight">
        {children}
    </h3>
);

export const CardConent = ({ children }: React.PropsWithChildren) => (
    <div className="p-6 pt-0">{children}</div>
);

export const Badge = ({
    children,
    variant = "default",
}: React.PropsWithChildren<{
    variant?: "default" | "success" | "destructive";
}>) => {
    const variantClasses = {
        default: "bg-primaryGreenDark text-white hover:bg-primaryGreen",
        success: "bg-green-500 text-white",
        destructive: "bg-red-500 text-white",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]}`}
        >
            {children}
        </span>
    );
};

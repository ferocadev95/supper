import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}

const Button = ({ children, className, disabled, onClick }: Props) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={twMerge(
                "btn-primary text-base px-4 py-2 md:px-8 md:py-3 rounded-full",
                className
            )}
        >
            {children}
        </button>
    );
};

export default Button;

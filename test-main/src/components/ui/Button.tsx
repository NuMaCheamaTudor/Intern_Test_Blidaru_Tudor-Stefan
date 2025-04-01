// src/components/ui/button.tsx
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
    const base = "py-2 px-4 rounded-xl transition font-medium text-sm";
    const variants: Record<Variant, string> = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 text-gray-800 hover:bg-gray-50",
    };

    return (
        <button className={cn(base, variants[variant], className)} {...props} />
    );
}

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
                           className,
                           ...props
                       }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 w-fit",
                className
            )}
            {...props}
        />
    );
}

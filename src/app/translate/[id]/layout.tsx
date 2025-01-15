import { type ReactNode } from "react";

export default function TranslateLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            {children}
        </div>
    );
}

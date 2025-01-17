import { type ReactNode } from "react";

export default function InterviewLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            {children}
        </div>
    );
}

import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import SidebarToggle from "./_components/sidebar-toggle";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "Konnect POC",
    description: "Demo app for Konnect",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    return (
        <html lang="en" className={`${GeistSans.variable}`}>
            <body>
                <TRPCReactProvider>
                    {session ? (
                        <SidebarProvider>
                            <AppSidebar
                                email={session.user.email ?? "user@example.com"}
                            />
                            <main className="min-h-screen w-full">
                                <SidebarToggle />
                                {children}
                            </main>
                            <Toaster />
                        </SidebarProvider>
                    ) : (
                        <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600">
                            <Link href={"/api/auth/signin"} prefetch={true}>
                                <Button size="lg">
                                    <User />
                                    SignIn
                                </Button>
                            </Link>
                        </main>
                    )}
                </TRPCReactProvider>
            </body>
        </html>
    );
}

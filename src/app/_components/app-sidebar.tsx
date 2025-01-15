"use client";

import * as React from "react";
import Link from "next/link";
import { FilePlus, FileText, LogOut, MoreVertical, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";

// Mock data for previous translations
const previousTranslations = [
    { id: 1, title: "English to Spanish", url: "/translate/1" },
    { id: 2, title: "French to German", url: "/translate/2" },
    { id: 3, title: "Japanese to Korean", url: "/translate/3" },
];

export function AppSidebar() {
    return (
        <Sidebar className="border-r">
            <SidebarHeader className="border-b px-4 py-2">
                <h2 className="text-lg font-semibold">Thothica Translate</h2>
            </SidebarHeader>
            <SidebarContent>
                <div className="mt-3">
                    {" "}
                    {/* Added space above the New button */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/" passHref prefetch={true}>
                                <SidebarMenuButton className="w-full justify-start gap-2">
                                    <FilePlus className="h-4 w-4" />
                                    New
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
                <SidebarGroup>
                    <SidebarGroupLabel>Previous Translations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {previousTranslations.map((translation) => (
                                <SidebarMenuItem key={translation.id}>
                                    <Link
                                        href={translation.url}
                                        passHref
                                        prefetch={true}
                                    >
                                        <SidebarMenuButton className="w-full justify-start gap-2 hover:bg-accent">
                                            <FileText className="h-4 w-4" />
                                            {translation.title}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src="/avatars/01.png" alt="User" />
                            <AvatarFallback>
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">
                                user@example.com
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link
                                    href={"/api/auth/signout"}
                                    prefetch={true}
                                    className="flex"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

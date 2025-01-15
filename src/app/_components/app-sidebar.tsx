import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { api } from "@/trpc/server"
import Link from "next/link";

export async function AppSidebar() {
    const translations = await api.translationsRouter.getAll();
    return (
        <Sidebar>
            <SidebarHeader>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Translations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {translations.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/translate/${item.id}`}>
                                            <span>{item.name ?? "Dummy title"}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

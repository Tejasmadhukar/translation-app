"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarToggle() {
    const { toggleSidebar, state } = useSidebar();

    return (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {state == "expanded" ? <ChevronLeft /> : <ChevronRight />}
        </Button>
    );
}

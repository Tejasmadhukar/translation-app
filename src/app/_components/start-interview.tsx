"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StartInterviewAction } from "./start-interview-action";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function StartInterview() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const interviewId = await StartInterviewAction();
            router.push(`/interview/${interviewId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error as string,
            });
        }
        setLoading(false);
    };
    return (
        <Button size="lg" onClick={handleClick} disabled={loading}>
            Start Interview
        </Button>
    );
}

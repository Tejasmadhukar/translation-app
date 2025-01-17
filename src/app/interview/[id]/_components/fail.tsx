import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InterviewFail({
    errorMessage,
}: {
    errorMessage: string;
}) {
    return (
        <Card className="">
            <CardHeader>
                <CardTitle className="text-destructive">Failed</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <svg
                        className="h-8 w-8 text-destructive"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <p className="text-center text-lg">{errorMessage}</p>
                <p className="text-center text-sm text-muted-foreground">
                    Please try again or contact support if the problem persists.
                </p>
            </CardContent>
        </Card>
    );
}

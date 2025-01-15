"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

export default function TranslateLoading({
    translateId,
}: {
    translateId: string;
}) {
    const translationQuery = api.translationsRouter.getById.useQuery(
        { translateId },
        {
            refetchInterval: 2000,
            refetchIntervalInBackground: true,
        },
    );

    if (translationQuery.data?.status != "loading") {
        window.location.reload();
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Translation in Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-center text-lg text-muted-foreground">
                    Translating your document...
                </p>
                <p className="text-center text-sm text-muted-foreground">
                    This may take a few moments
                </p>
            </CardContent>
        </Card>
    );
}

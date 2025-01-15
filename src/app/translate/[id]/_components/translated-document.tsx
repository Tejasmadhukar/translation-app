import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface FinalDocumentProps {
    content: string;
}

export default function TranslatedDocument({ content }: FinalDocumentProps) {
    return (
        <div className="mb-12 flex flex-col">
            <div className="rounded-xl bg-card">
                {/* Header */}
                <div className="border-b px-6 py-3">
                    <div className="mx-auto flex max-w-3xl items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold">
                            Translated Document
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="mx-auto max-w-3xl px-6">
                        <div className="h-full py-6">
                            <ScrollArea className="h-[calc(100vh-20rem)]">
                                <article className="prose prose-sm dark:prose-invert max-w-none pr-6">
                                    <pre className="whitespace-pre-wrap">
                                        {content}
                                    </pre>
                                </article>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

function recordToArray(record: Record<number, string>): string[] {
    const result: string[] = [];

    for (const [key, value] of Object.entries(record)) {
        const index = Number(key); // Convert the key to a number
        result[index] = value; // Assign the value at the specified index
    }

    return result;
}

export default function TranslateForm() {
    const [documentType, setDocumentType] = useState("");
    const [targetLanguage, setTargetLanguage] = useState("");
    const [hasChapters, setHasChapters] = useState(false);
    const [numChapters, setNumChapters] = useState(1);
    const [chapters, setChapters] = useState<Record<number, string>>({});
    const [content, setContent] = useState("");

    const router = useRouter();

    const submitMutation = api.translationsRouter.translateDocument.useMutation(
        {
            onMutate(variables) {
                router.push(`/translate/${variables.documentId}`);
            },
        },
    );

    const documentTypes = [
        "Books, Academic Papers, and Technical Content",
        "News/Journalistic Writing",
        "Literary (Poetry or Prose)",
        "Legal",
    ] as const;

    const handleChapterChange = (chapterNum: number, value: string) => {
        setChapters((prev) => ({
            ...prev,
            [chapterNum]: value,
        }));
    };

    const renderChapters = () => {
        const chapterInputs = [];
        for (let i = 1; i <= numChapters; i++) {
            chapterInputs.push(
                <div key={i} className="space-y-2">
                    <Label htmlFor={`chapter${i}`}>Chapter {i}</Label>
                    <Textarea
                        id={`chapter${i}`}
                        value={chapters[i] ?? ""}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            handleChapterChange(i, e.target.value)
                        }
                        placeholder={`Enter Chapter ${i} content`}
                        className="min-h-32"
                    />
                </div>,
            );
        }
        return chapterInputs;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // @ts-expect-error I have more infromation than the compiler ?
        submitMutation.mutate({
            inputDocument: content,
            chapters: recordToArray(chapters),
            documentType: documentType as DocumentType,
            documentId: nanoid(),
            targetLanguage,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Translate your content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="documentType">Document Type</Label>
                        <Select
                            defaultValue="Legal"
                            value={documentType}
                            onValueChange={setDocumentType}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                {documentTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetLanguage">Target Language</Label>
                        <Input
                            id="targetLanguage"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            placeholder="Enter target language"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="chapters"
                            checked={hasChapters}
                            onCheckedChange={() =>
                                setHasChapters((prev) => !prev)
                            }
                        />
                        <Label htmlFor="chapters">Add Chapters</Label>
                    </div>

                    {hasChapters ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="numChapters">
                                    Number of Chapters
                                </Label>
                                <Input
                                    id="numChapters"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={numChapters}
                                    onChange={(e) =>
                                        setNumChapters(
                                            Math.min(
                                                100,
                                                Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                        1,
                                                ),
                                            ),
                                        )
                                    }
                                />
                            </div>
                            {renderChapters()}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(
                                    e: ChangeEvent<HTMLTextAreaElement>,
                                ) => setContent(e.target.value)}
                                placeholder="Enter document content"
                                className="min-h-32"
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        disabled={submitMutation.isPending}
                        type="submit"
                        className="w-full"
                    >
                        Submit Document
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

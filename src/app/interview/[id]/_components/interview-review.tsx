"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { type InterviewMessageType } from "@/server/db/schema";

export default function InterviewReview({
    messages,
}: {
    messages: InterviewMessageType[];
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
        new Set(),
    );

    const filteredMessages = messages.filter((message) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const toggleMessageExpansion = (id: string) => {
        setExpandedMessages((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="container mx-auto max-w-4xl p-4">
            <h1 className="mb-6 text-center text-3xl font-bold">
                Interview Review
            </h1>
            <div className="relative mb-4">
                <Input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                    {filteredMessages.map((message) => (
                        <Card
                            key={message.id}
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                        >
                            <CardContent className="p-4">
                                <div className="mb-2 flex items-start justify-between">
                                    <span
                                        className={`font-semibold ${message.role === "user" ? "text-blue-600" : "text-green-600"}`}
                                    >
                                        {message.role === "user"
                                            ? "You"
                                            : "Assistant"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatTimeIn12Hour(message.createdAt)}
                                    </span>
                                </div>
                                <p
                                    className={`text-gray-700 ${expandedMessages.has(message.id) ? "" : "line-clamp-3"}`}
                                >
                                    {message.content}
                                </p>
                                {message.content.split("\n").length > 3 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() =>
                                            toggleMessageExpansion(message.id)
                                        }
                                    >
                                        {expandedMessages.has(message.id) ? (
                                            <>
                                                <ChevronUp className="mr-2 h-4 w-4" />
                                                Show Less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="mr-2 h-4 w-4" />
                                                Show More
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function formatTimeIn12Hour(date: Date): string {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${hours}:${minutes}:${seconds} ${ampm}`;
}

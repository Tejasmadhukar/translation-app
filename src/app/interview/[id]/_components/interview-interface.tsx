"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X } from "lucide-react";
import { useRecordVoice } from "./useRecordVoice";

export default function InterviewInterface({
    interviewId,
}: {
    interviewId: string;
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const { startRecording, stopRecording, text } = useRecordVoice();

    const handlePlay = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Clean up previous audio URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            const arrayBuffer = await generateSpeech(text);
            const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            setAudioUrl(url);

            if (audioRef.current) {
                audioRef.current.src = url;
                await audioRef.current.play();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate speech",
            );
            console.error("Error generating speech:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            // Stop recording and send audio to API
            setIsRecording(false);
            setIsThinking(true);
            stopRecording();
            setIsThinking(false);
        } else {
            // Start recording
            setIsRecording(true);
            startRecording();
        }
    };

    const endInterview = () => {
        alert("Interview ended");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <div
                className={`mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-gray-800 text-4xl ${isRecording ? "animate-pulse-green" : ""} ${isAiSpeaking ? "animate-pulse-blue" : ""} `}
            >
                AI
            </div>

            {isThinking && <p className="mb-4">Thinking...</p>}
            {text && text.length > 0 && <p>{text}</p>}

            <div className="mb-8 flex space-x-4">
                <Button onClick={toggleRecording}>
                    {isRecording ? (
                        <Mic className="text-red-500" />
                    ) : (
                        <MicOff />
                    )}
                </Button>
                <Button onClick={endInterview} variant="destructive">
                    <X />
                </Button>
            </div>

            <audio
                ref={audioRef}
                controls
                onEnded={() => setIsAiSpeaking(false)}
            />
        </div>
    );
}

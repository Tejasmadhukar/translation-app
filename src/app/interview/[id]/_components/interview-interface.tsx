"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X } from "lucide-react";
import { useRecordVoice } from "./useRecordVoice";
import { EndInterviewActiond } from "./end-interview-action";
import { useRouter } from "next/navigation";

export default function InterviewInterface({
    interviewId,
}: {
    interviewId: string;
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const router = useRouter();

    const { startRecording, stopRecording, audioUrl } = useRecordVoice({
        interviewId,
    });

    useEffect(() => {
        async function playAudio() {
            if (audioRef.current && audioUrl) {
                audioRef.current.src = audioUrl;
                setIsAiSpeaking(true);
                await audioRef.current.play();
                setIsAiSpeaking(false);
            }
        }
        playAudio();
    }, [audioUrl]);

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording and send audio to API
            setIsRecording(false);
            stopRecording();
        } else {
            // Start recording
            setIsRecording(true);
            startRecording();
        }
    };

    const endInterview = async () => {
        await EndInterviewActiond(interviewId);
        router.refresh();
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <div
                className={`mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-gray-300 text-4xl ${isRecording ? "animate-pulse-green" : ""} ${isAiSpeaking ? "animate-pulse-blue" : ""} `}
            >
                AI
            </div>

            {isThinking && <p className="mb-4">Thinking...</p>}

            <div className="mb-8 flex space-x-4">
                <Button onClick={toggleRecording} disabled={isAiSpeaking}>
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

            <audio ref={audioRef} controls className="hidden" />
        </div>
    );

    // return <MicrophoneComponent />
}

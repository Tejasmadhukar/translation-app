"use client";

// Import necessary modules and components
import { useEffect, useState, useRef } from "react";

// Declare a global interface to add the webkitSpeechRecognition property to the Window object
declare global {
    interface Window {
        // eslint-disable-next-line
        webkitSpeechRecognition: any;
    }
}

// Export the MicrophoneComponent function component
export default function MicrophoneComponent() {
    // State variables to manage recording status, completion, and transcript
    const [isRecording, setIsRecording] = useState(false);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [transcript, setTranscript] = useState("");

    // Reference to store the SpeechRecognition instance
    // eslint-disable-next-line
    const recognitionRef = useRef<any>(null);

    // Function to start recording
    const startRecording = () => {
        setIsRecording(true);
        // Create a new SpeechRecognition instance and configure it
        // eslint-disable-next-line
        recognitionRef.current = new window.webkitSpeechRecognition();
        // eslint-disable-next-line
        recognitionRef.current.continuous = true;
        // eslint-disable-next-line
        recognitionRef.current.interimResults = true;

        // Event handler for speech recognition results
        // eslint-disable-next-line
        recognitionRef.current.onresult = (event: any) => {
            // eslint-disable-next-line
            const { transcript } = event.results[event.results.length - 1][0];

            // Log the recognition results and update the transcript state
            // eslint-disable-next-line
            console.log(event.results);
            // eslint-disable-next-line
            setTranscript(transcript);
        };

        // Start the speech recognition
        // eslint-disable-next-line
        recognitionRef.current.start();
    };

    // Cleanup effect when the component unmounts
    useEffect(() => {
        return () => {
            // Stop the speech recognition if it's active
            if (recognitionRef.current) {
                // eslint-disable-next-line
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Function to stop recording
    const stopRecording = () => {
        if (recognitionRef.current) {
            // Stop the speech recognition and mark recording as complete
            // eslint-disable-next-line
            recognitionRef.current.stop();
            setRecordingComplete(true);
        }
    };

    // Toggle recording state and manage recording actions
    const handleToggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    // Render the microphone component with appropriate UI based on recording state
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="w-full">
                {(isRecording || transcript) && (
                    <div className="m-auto w-1/4 rounded-md border bg-white p-4">
                        <div className="flex w-full flex-1 justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {recordingComplete
                                        ? "Recorded"
                                        : "Recording"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {recordingComplete
                                        ? "Thanks for talking."
                                        : "Start speaking..."}
                                </p>
                            </div>
                            {isRecording && (
                                <div className="h-4 w-4 animate-pulse rounded-full bg-red-400" />
                            )}
                        </div>

                        {transcript && (
                            <div className="h-fullm mt-4 rounded-md border p-2">
                                <p className="mb-0">{transcript}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex w-full items-center">
                    {isRecording ? (
                        // Button for stopping recording
                        <button
                            onClick={handleToggleRecording}
                            className="m-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-red-400 hover:bg-red-500 focus:outline-none"
                        >
                            <svg
                                className="h-12 w-12"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill="white"
                                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                                />
                            </svg>
                        </button>
                    ) : (
                        // Button for starting recording
                        <button
                            onClick={handleToggleRecording}
                            className="m-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-blue-400 hover:bg-blue-500 focus:outline-none"
                        >
                            <svg
                                viewBox="0 0 256 256"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-white"
                            >
                                <path
                                    fill="currentColor" // Change fill color to the desired color
                                    d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

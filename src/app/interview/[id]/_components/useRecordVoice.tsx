"use client";
// @ts-nocheck
import { useEffect, useState, useRef } from "react";

export const useRecordVoice = ({ interviewId }: { interviewId: string }) => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const isRecording = useRef(false);
    const chunks = useRef([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const startRecording = () => {
        if (mediaRecorder) {
            isRecording.current = true;
            mediaRecorder.start();
            setRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            isRecording.current = false;
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const getText = async (base64data) => {
        try {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            const response = await fetch("/api/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    audio: base64data,
                    interviewId,
                }),
            }).then((res) => res.blob());
            const url = URL.createObjectURL(response);
            setAudioUrl(url);
        } catch (error) {
            console.log(error);
        }
    };

    const initialMediaRecorder = (stream) => {
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
            createMediaStream(stream);
            chunks.current = [];
        };

        mediaRecorder.ondataavailable = (ev) => {
            chunks.current.push(ev.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
            blobToBase64(audioBlob, getText);
        };

        setMediaRecorder(mediaRecorder);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(initialMediaRecorder);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return { recording, startRecording, stopRecording, audioUrl };
};

const blobToBase64 = (blob, callback) => {
    const reader = new FileReader();
    reader.onload = function () {
        const base64data = reader?.result?.split(",")[1];
        callback(base64data);
    };
    reader.readAsDataURL(blob);
};

const getPeakLevel = (analyzer) => {
    const array = new Uint8Array(analyzer.fftSize);
    analyzer.getByteTimeDomainData(array);
    return (
        array.reduce(
            (max, current) => Math.max(max, Math.abs(current - 127)),
            0,
        ) / 128
    );
};

const createMediaStream = (stream, isRecording, callback) => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyzer = context.createAnalyser();
    source.connect(analyzer);
    const tick = () => {
        const peak = getPeakLevel(analyzer);
        if (isRecording) {
            callback(peak);
            requestAnimationFrame(tick);
        }
    };
    tick();
};

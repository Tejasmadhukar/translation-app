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
            // @ts-expect-error mierda
            mediaRecorder.start(); //eslint-disable-line
            setRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            isRecording.current = false;
            // @ts-expect-error mierda
            mediaRecorder.stop(); // eslint-disable-line
            setRecording(false);
        }
    };

    // @ts-expect-error mierda
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
                    audio: base64data, //eslint-disable-line
                    interviewId,
                }),
            }).then((res) => res.blob());
            const url = URL.createObjectURL(response);
            setAudioUrl(url);
        } catch (error) {
            console.log(error);
        }
    };

    // @ts-expect-error mierda
    const initialMediaRecorder = (stream) => {
        const mediaRecorder = new MediaRecorder(stream); // eslint-disable-line

        mediaRecorder.onstart = () => {
            // @ts-expect-error mierda
            createMediaStream(stream);
            chunks.current = [];
        };

        mediaRecorder.ondataavailable = (ev) => {
            // @ts-expect-error mierda
            chunks.current.push(ev.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
            blobToBase64(audioBlob, getText);
        };

        // @ts-expect-error mierda
        setMediaRecorder(mediaRecorder);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            navigator.mediaDevices // eslint-disable-line
                .getUserMedia({ audio: true })
                .then(initialMediaRecorder);
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return { recording, startRecording, stopRecording, audioUrl };
};

// @ts-expect-error mierda
const blobToBase64 = (blob, callback) => {
    const reader = new FileReader();
    reader.onload = function () {
        // @ts-expect-error mierda
        const base64data = reader?.result?.split(",")[1]; // eslint-disable-line
        callback(base64data); // eslint-disable-line
    };
    reader.readAsDataURL(blob); // eslint-disable-line
};

// @ts-expect-error mierda
const getPeakLevel = (analyzer) => {
    const array = new Uint8Array(analyzer.fftSize); // eslint-disable-line
    analyzer.getByteTimeDomainData(array); // eslint-disable-line
    return (
        array.reduce(
            (max, current) => Math.max(max, Math.abs(current - 127)),
            0,
        ) / 128
    );
};

// @ts-expect-error mierda
const createMediaStream = (stream, isRecording, callback) => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream); // eslint-disable-line
    const analyzer = context.createAnalyser();
    source.connect(analyzer);
    const tick = () => {
        const peak = getPeakLevel(analyzer);
        if (isRecording) {
            callback(peak); // eslint-disable-line
            requestAnimationFrame(tick);
        }
    };
    tick();
};

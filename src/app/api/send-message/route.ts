import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";
import { tmpdir } from "os";
import { createReadStream, unlinkSync, writeFileSync } from "fs";
import { env } from "@/env";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { interviewMessages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { arrayBuffer } from "stream/consumers";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const interviewerPrompt = 'You are a interviewer of a very big tech company, ask questions, introductions and eveything like a interviewer. You are taking interview of a person, ASk them logical questions about data structures.'

const addMessage = async (content: string, role: 'system' | 'user', interviewId: string) => {
    await db.insert(interviewMessages).values({
        content,
        role,
        interviewId
    })
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) return NextResponse.error()
    //eslint-disable-next-line
    const body = await req.json()

    //eslint-disable-next-line
    const base64Audio = body.audio;
    //eslint-disable-next-line
    const interviewId = body.interviewId as string | undefined
    if (!interviewId) return NextResponse.error()

    const messages = await db.select().from(interviewMessages).where(eq(interviewMessages.interviewId, interviewId)).orderBy(desc(interviewMessages.createdAt))

    const openaiMessages: [
        { role: "assistant" | "user" | "system"; content: string },
    ] = [{ role: "assistant", content: interviewerPrompt }];

    if (messages.length != 0) {
        const old = messages.map((message) => ({
            role: message.role,
            content: message.content,
        }));
        for (const m of old) {
            openaiMessages.push(m);
        }
    }

    // Convert the base64 audio data to a Buffer
    //eslint-disable-next-line
    const audio = Buffer.from(base64Audio, "base64");


    // Define the file path for storing the temporary WAV file
    const filename = `input-${Date.now()}.wav`;
    const filePath = path.join(tmpdir(), filename);

    try {
        // Write the audio data to a temporary WAV file synchronously
        writeFileSync(filePath, audio);

        // Create a readable stream from the temporary WAV file
        const readStream = createReadStream(filePath);

        const data = await openai.audio.transcriptions.create({
            file: readStream,
            model: "whisper-1",
        });

        // Remove the temporary file after successful processing
        unlinkSync(filePath);

        console.log(data.text)

        await addMessage(data.text, "user", interviewId)
        openaiMessages.push({ role: "user", content: data.text });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: openaiMessages,
        });

        const assistantMessage = response.choices[0]?.message.content;
        if (!assistantMessage) {
            throw new Error("Failed to get a response from OpenAI API.");
        }

        await addMessage(assistantMessage, "system", interviewId)

        const assistantVoiceResponse = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: assistantMessage,
        });

        const buffer = await assistantVoiceResponse.arrayBuffer()
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        });
    } catch (error) {
        console.error("Error processing audio:", error);
        return NextResponse.error();
    }
}

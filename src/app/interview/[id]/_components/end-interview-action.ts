"use server";
import { db } from "@/server/db";
import { interviews } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import "server-only";

export async function EndInterviewActiond(interviewId: string) {
    await db
        .update(interviews)
        .set({ status: "completed" })
        .where(eq(interviews.id, interviewId));
}

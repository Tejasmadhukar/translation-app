"use server";
import { api } from "@/trpc/server";
import "server-only";

export async function StartInterviewAction() {
    const interviewId = await api.InterviewRouter.create();
    return interviewId;
}

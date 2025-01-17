import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { interviews } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";

export const InterviewRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const interviews = await ctx.db.query.interviews.findMany({
            where: (i, { eq }) => eq(i.userId, ctx.session.user.id),
            orderBy: (i, { desc }) => desc(i.createdAt),
        });
        return interviews;
    }),
    getById: protectedProcedure
        .input(z.object({ interviewId: z.string() }))
        .query(async ({ input, ctx }) => {
            const interview = await ctx.db.query.interviews.findFirst({
                where: (i, { eq }) => eq(i.id, input.interviewId),
            });
            return interview;
        }),
    getAllMessages: protectedProcedure
        .input(z.object({ interviewId: z.string() }))
        .query(async ({ input, ctx }) => {
            const messages = await ctx.db.query.interviewMessages.findMany({
                where: (m, { eq }) => eq(m.interviewId, input.interviewId),
                orderBy: (m, { asc }) => asc(m.createdAt),
            });
            return messages;
        }),
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const newInterview = await ctx.db
            .insert(interviews)
            .values({ userId: ctx.session.user.id })
            .returning();
        if (!newInterview[0]?.id) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
            });
        }
        revalidatePath("/")
        return newInterview[0].id;
    }),
});

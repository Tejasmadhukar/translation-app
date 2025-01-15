import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { translateDocument } from "./translate-document";

export const translationsRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const translations = await ctx.db.query.translations.findMany({
            where: (t, { eq }) => eq(t.createdById, ctx.session.user.id),
            orderBy: (t, { desc }) => desc(t.createdAt),
        });
        return translations;
    }),
    getById: protectedProcedure
        .input(z.object({ translateId: z.string() }))
        .query(async ({ input, ctx }) => {
            const translate = await ctx.db.query.translations.findFirst({
                where: (t, { eq }) => eq(t.id, input.translateId),
            });
            return translate;
        }),
    translateDocument,
});

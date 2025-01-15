import { createTRPCRouter, protectedProcedure } from "../trpc";

export const translationsRouter = createTRPCRouter({
    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            const translations = ctx.db.query.translations.findMany({
                where: (t, { eq }) => eq(t.createdById, ctx.session.user.id),
                orderBy: (t, { desc }) => desc(t.createdAt)
            })
            return translations;
        })
})

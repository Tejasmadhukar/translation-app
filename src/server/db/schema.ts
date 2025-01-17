import { relations, sql } from "drizzle-orm";
import {
    index,
    int,
    primaryKey,
    sqliteTableCreator,
    text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";
import { nanoid } from "nanoid";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `konnect-poc_${name}`);

export const interviewMessages = createTable("interview_message", {
    id: text("id", { length: 255 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => nanoid()),
    role: text("role", { enum: ["assistant", "user", "system"] }).notNull(),
    content: text("content").notNull(),
    interviewId: text("interview_id", { length: 255 })
        .notNull()
        .references(() => interviews.id),
    createdAt: int("created_at", { mode: "timestamp" })
        .default(sql`(unixepoch())`)
        .notNull(),
});

export type InterviewMessageType = typeof interviewMessages.$inferSelect;

export const interviewMessagesRelations = relations(
    interviewMessages,
    ({ one }) => ({
        interview: one(interviews, {
            fields: [interviewMessages.interviewId],
            references: [interviews.id],
        }),
    }),
);

export const interviews = createTable("interview", {
    id: text("id", { length: 255 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => nanoid()),
    title: text("title", { length: 256 }),
    status: text("status", { enum: ["ongoing", "completed"] })
        .notNull()
        .default("ongoing"),
    userId: text("user_id", { length: 255 })
        .notNull()
        .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
        .default(sql`(unixepoch())`)
        .notNull(),
});

export const interviewRelations = relations(interviews, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [interviews.userId],
        references: [users.id],
    }),
    messages: many(interviewMessages),
}));

export const users = createTable("user", {
    id: text("id", { length: 255 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name", { length: 255 }),
    email: text("email", { length: 255 }).notNull(),
    emailVerified: int("email_verified", {
        mode: "timestamp",
    }).default(sql`(unixepoch())`),
    image: text("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    interviews: many(interviews),
}));

export const accounts = createTable(
    "account",
    {
        userId: text("user_id", { length: 255 })
            .notNull()
            .references(() => users.id),
        type: text("type", { length: 255 })
            .$type<AdapterAccount["type"]>()
            .notNull(),
        provider: text("provider", { length: 255 }).notNull(),
        providerAccountId: text("provider_account_id", {
            length: 255,
        }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: int("expires_at"),
        token_type: text("token_type", { length: 255 }),
        scope: text("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: text("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
        userIdIdx: index("account_user_id_idx").on(account.userId),
    }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
    "session",
    {
        sessionToken: text("session_token", { length: 255 })
            .notNull()
            .primaryKey(),
        userId: text("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        expires: int("expires", { mode: "timestamp" }).notNull(),
    },
    (session) => ({
        userIdIdx: index("session_userId_idx").on(session.userId),
    }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    "verification_token",
    {
        identifier: text("identifier", { length: 255 }).notNull(),
        token: text("token", { length: 255 }).notNull(),
        expires: int("expires", { mode: "timestamp" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    }),
);

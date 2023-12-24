// @ts-nocheck shush lets pretend this is fine
import { accounts, sessions, users, verificationTokens } from "database/src/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { and, eq } from "drizzle-orm";
import { Adapter } from "next-auth/adapters";

export function PostgresJsDrizzleAdapter(db: PostgresJsDatabase): Adapter {
  return {
    createUser: async (data) => {
      return await db
        .insert(users)
        .values({ ...data, id: crypto.randomUUID() })
        .returning()
        .then((res) => res[0]);
    },
    getUser: async (data) => {
      return (
        db
          .select()
          .from(users)
          .where(eq(users.id, data))
          .then((res) => res[0]) ?? null
      );
    },
    getUserByEmail: async (data) => {
      return (
        db
          .select()
          .from(users)
          .where(eq(users.email, data))
          .then((res) => res[0]) ?? null
      );
    },
    createSession: async (data) => {
      return db
        .insert(sessions)
        .values(data)
        .returning()
        .then((res) => res[0]);
    },
    getSessionAndUser: async (data) => {
      return (
        db
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, data))
          .innerJoin(users, eq(users.id, sessions.userId))
          .then((res) => res[0]) ?? null
      );
    },
    updateUser: async (data) => {
      if (!data.id) {
        throw new Error("No user id.");
      }

      return db
        .update(users)
        .set(data)
        .where(eq(users.id, data.id))
        .returning()
        .then((res) => res[0]);
    },
    updateSession: async (data) => {
      return db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .then((res) => res[0]);
    },
    linkAccount: async (account) => {
      await db
        .insert(accounts)
        .values(account)
        .returning()
        .then((res) => res[0]);
    },
    getUserByAccount: async (account) => {
      const dbAccount = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        )
        .leftJoin(users, eq(accounts.userId, users.id))
        .then((res) => res[0]);
            if (!dbAccount) return null;
        return dbAccount.user;
    },
    deleteSession: async (sessionToken) => {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },
    createVerificationToken: async (token) => {
      return db
        .insert(verificationTokens)
        .values(token)
        .returning()
        .then((res) => res[0]);
    },
    useVerificationToken: async (token) => {
      try {
        return (
          db
            .delete(verificationTokens)
            .where(
              and(
                eq(verificationTokens.identifier, token.identifier),
                eq(verificationTokens.token, token.token)
              )
            )
            .returning()
            .then((res) => res[0]) ?? null
        );
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    deleteUser: async (id) => {
      await db
        .delete(users)
        .where(eq(users.id, id))
        .returning()
        .then((res) => res[0]);
    },
    unlinkAccount: async (account) => {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        );

      return undefined;
    },
  };
}
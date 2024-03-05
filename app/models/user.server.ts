import bcryptjs from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";

import { generatePhoto } from "./generatePhoto";
import {
  ExpertiseLevel,
  expertiseLevel,
  users,
} from "../drizzle/schema.server";
import { db } from "../drizzle/db.server";

const { compare, hash } = bcryptjs;

const userSelect = {
  id: users.id,
  email: users.email,
  expertiseLevels: users.expertiseLevels,
  isAdmin: users.isAdmin,
  preferredExpertiseLevel: users.preferredExpertiseLevel,
  bartenderToken: users.bartenderToken,
  bartenderTokenExpiresAt: users.bartenderTokenExpiresAt,
  photo: users.photo,
} as const;
type FullUser = typeof users.$inferSelect;
export type User = Omit<FullUser, "passwordHash" | "createdAt" | "updatedAt">;
export type TokenLessUser = Omit<
  User,
  "bartenderToken" | "bartenderTokenExpiresAt"
>;

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email already registered");
  }
}

export async function register(email: string, password: string) {
  const isAdmin = await firstUserShouldBeAdmin();
  const SALT_LENGTH = 10;
  const passwordHash = await hash(password, SALT_LENGTH);
  const photo = generatePhoto(email);
  type NewUser = typeof users.$inferInsert;
  const value: NewUser = {
    email,
    isAdmin,
    passwordHash,
    photo,
  };

  try {
    const newUser = await db.insert(users).values(value).returning({
      id: users.id,
    });
    return newUser[0];
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      const uniqueConstraintErrorCode = "23505";
      if (error.code === uniqueConstraintErrorCode) {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
    throw error;
  }
}

let IS_FIRST_USER = true;

async function firstUserShouldBeAdmin() {
  if (!IS_FIRST_USER) {
    return false;
  }

  const result = await db
    .select({
      id: users.id,
    })
    .from(users)
    .limit(1);
  IS_FIRST_USER = result.length === 0;
  return IS_FIRST_USER;
}

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
  }
}

export class WrongPasswordError extends Error {
  constructor() {
    super("Wrong password");
  }
}

export async function localLogin(email: string, password: string) {
  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (foundUsers.length === 0) {
    throw new UserNotFoundError();
  }
  const user = foundUsers[0];
  const { passwordHash, ...userWithoutPasswordHash } = user;
  if (!passwordHash) {
    throw new WrongPasswordError();
  }
  const isValid = await compare(password, passwordHash);
  if (!isValid) {
    throw new WrongPasswordError();
  }

  return userWithoutPasswordHash;
}

export async function oauthregister(email: string, photo?: string) {
  const isAdmin = await firstUserShouldBeAdmin();
  const user = await db
    .insert(users)
    .values({
      email,
      isAdmin,
      photo: photo ?? generatePhoto(email),
    })
    .onConflictDoNothing()
    .returning({
      id: users.id,
    });
  return user[0].id;
}

export async function getUserById(userId: string): Promise<User> {
  const foundUsers = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.id, userId));
  if (foundUsers.length === 0) {
    throw new UserNotFoundError();
  }
  return foundUsers[0];
}

export async function getUserByEmail(email: string): Promise<User> {
  const foundUsers = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.email, email));
  if (foundUsers.length === 0) {
    throw new UserNotFoundError();
  }
  return foundUsers[0];
}

export function isSubmitAllowed(level: string) {
  return level !== "";
}

export async function listUsers(limit = 100, offset = 0): Promise<User[]> {
  return await db.select(userSelect).from(users).limit(limit).offset(offset);
}

export function listExpertiseLevels() {
  return expertiseLevel.enumValues;
}

const now = sql<string>`now()`;

export async function assignExpertiseLevel(
  userId: string,
  level: ExpertiseLevel
) {
  // set preferred level to the assigned level if no preferred level is set
  const user = await getUserById(userId);
  const preferredExpertiseLevel = user.preferredExpertiseLevel
    ? user.preferredExpertiseLevel
    : level;

  // retain order should be easy,expert,guru
  const expertiseLevels = expertiseLevel.enumValues.filter(
    (l) => user.expertiseLevels.includes(l) || level === l
  );

  await db
    .update(users)
    .set({
      preferredExpertiseLevel,
      expertiseLevels,
      updatedAt: now,
    })
    .where(eq(users.id, userId));
}

export async function unassignExpertiseLevel(
  userId: string,
  level: ExpertiseLevel
) {
  const user = await getUserById(userId);
  const remainingLevels = user.expertiseLevels.filter((name) => name !== level);
  let preferredExpertiseLevel = user.preferredExpertiseLevel;
  // set preferred level to the first remaining level if the preferred level is the one being removed
  if (preferredExpertiseLevel === level) {
    preferredExpertiseLevel = remainingLevels[0] || null;
  }

  await db
    .update(users)
    .set({
      preferredExpertiseLevel,
      expertiseLevels: remainingLevels,
      updatedAt: now,
    })
    .where(eq(users.id, userId));
}

export async function setPreferredExpertiseLevel(
  userId: string,
  preferredExpertiseLevel: ExpertiseLevel
) {
  await db
    .update(users)
    .set({
      preferredExpertiseLevel,
      updatedAt: now,
    })
    .where(eq(users.id, userId));
}

export async function setIsAdmin(userId: string, isAdmin: boolean) {
  await db
    .update(users)
    .set({
      isAdmin,
      updatedAt: now,
    })
    .where(eq(users.id, userId));
}

export async function setBartenderToken(
  userId: string,
  token: string,
  expireAt: number
) {
  await db
    .update(users)
    .set({
      bartenderToken: token,
      bartenderTokenExpiresAt: expireAt,
      // Dont update updatedNow as this is an internal operation
    })
    .where(eq(users.id, userId));
}

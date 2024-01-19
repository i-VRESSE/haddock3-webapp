import { compare, hash } from "bcryptjs";
import { ExpertiseLevel } from "@prisma/client";

import { generatePhoto } from "./generatePhoto";
import { db } from "./db.server";

export interface User {
  readonly id: string;
  readonly email: string;
  readonly expertiseLevels: ExpertiseLevel[];
  readonly isAdmin: boolean;
  readonly preferredExpertiseLevel: ExpertiseLevel | null;
  readonly bartenderToken: string | null;
  readonly bartenderTokenExpiresAt: number;
  readonly photo: string;
}

export type TokenLessUser = Omit<
  User,
  "bartenderToken" | "bartenderTokenExpiresAt"
>;

const userSelect = {
  id: true,
  email: true,
  expertiseLevels: true,
  isAdmin: true,
  preferredExpertiseLevel: true,
  bartenderToken: true,
  bartenderTokenExpiresAt: true,
  photo: true,
} as const;

export async function register(email: string, password: string) {
  const isAdmin = await firstUserShouldBeAdmin();
  const passwordHash = await hash(password, 10);
  const photo = generatePhoto(email);
  const user = await db.user.create({
    data: {
      email,
      isAdmin,
      passwordHash,
      photo,
    },
    select: userSelect,
  });
  return user;
}

let USER_COUNT_CACHE = 0;

async function firstUserShouldBeAdmin() {
  if (USER_COUNT_CACHE > 0) {
    return false;
  }
  const userCount = await db.user.count();
  if (userCount > 0) {
    USER_COUNT_CACHE = 1;
  }
  return userCount === 0;
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
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
    select: {
      ...userSelect,
      passwordHash: true,
    },
  });
  if (!user) {
    throw new UserNotFoundError();
  }
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
  const user = await db.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      isAdmin,
      photo: photo ?? generatePhoto(email),
    },
    update: {},
    select: {
      id: true,
    },
  });
  return user.id;
}

export async function getUserById(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
    select: userSelect,
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export function isSubmitAllowed(level: string) {
  return level !== "";
}

export async function listUsers(limit = 100, offset = 0) {
  const users = await db.user.findMany({
    select: userSelect,
    take: limit,
    skip: offset,
  });
  return users;
}

export function listExpertiseLevels() {
  const array = Array.from(Object.values(ExpertiseLevel));
  if (array.length === 0) {
    throw new Error("No expertise levels found");
  }
  // cast needed for valibot.enumpType
  return array as [ExpertiseLevel, ...ExpertiseLevel[]];
}

export async function assignExpertiseLevel(
  userId: string,
  level: ExpertiseLevel
) {
  // set preferred level to the assigned level if no preferred level is set
  const user = await getUserById(userId);
  const preferredExpertiseLevel = user.preferredExpertiseLevel
    ? user.preferredExpertiseLevel
    : level;

  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      preferredExpertiseLevel,
      expertiseLevels: {
        push: level,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function unassignExpertiseLevel(
  userId: string,
  level: ExpertiseLevel
) {
  // set preferred level to the first remaining level if the preferred level is the one being removed
  const user = await getUserById(userId);
  const remainingLevels = user.expertiseLevels
    .map((level) => level)
    .filter((name) => name !== level);
  let preferredExpertiseLevel = user.preferredExpertiseLevel;
  if (preferredExpertiseLevel === level) {
    preferredExpertiseLevel = remainingLevels[0] || null;
  }

  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      preferredExpertiseLevel,
      expertiseLevels: {
        set: remainingLevels,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function setPreferredExpertiseLevel(
  userId: string,
  preferredExpertiseLevel: ExpertiseLevel
) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      expertiseLevels: true,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      preferredExpertiseLevel,
    },
    select: {
      id: true,
    },
  });
}

export async function setIsAdmin(userId: string, isAdmin: boolean) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      isAdmin,
    },
    select: {
      id: true,
    },
  });
}

export async function setBartenderToken(
  userId: string,
  token: string,
  expireAt: number
) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      bartenderToken: token,
      bartenderTokenExpiresAt: expireAt,
    },
    select: {
      id: true,
    },
  });
}

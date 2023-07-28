import { db } from "~/utils/db.server";
import { compare, hash } from "bcryptjs";

export interface User {
  readonly id: string;
  readonly email: string;
  readonly expertiseLevels: {
    readonly name: string;
  }[];
  readonly isAdmin: boolean;
  readonly preferredExpertiseLevel: string | null;
  readonly bartenderToken: string | null;
  readonly bartenderTokenExpiresAt: Date | null;
}

const userSelect = {
  id: true,
  email: true,
  expertiseLevels: {
    select: {
      name: true,
    },
  },
  isAdmin: true,
  preferredExpertiseLevel: true,
  bartenderToken: true,
  bartenderTokenExpiresAt: true,
} as const;

export async function register(email: string, password: string) {
  const isAdmin = await firstUserShouldBeAdmin();
  const passwordHash = await hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      isAdmin,
      passwordHash,
    },
    select: userSelect,
  });
  return user;
}

async function firstUserShouldBeAdmin() {
  const userCount = await db.user.count();
  return userCount === 0
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
    throw new Error("User not found");
  }
  const { passwordHash, ...userWithoutPasswordHash } = user;
  const isValid = await compare(password, user.passwordHash || "");
  if (!isValid) {
    throw new Error("Wrong password");
  }

  return userWithoutPasswordHash;
}

export async function oauthregister(email: string) {
  const isAdmin = await firstUserShouldBeAdmin();
  const user = await db.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      isAdmin,
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

export async function verifyIsAdmin(id: string) {
  const result = await db.user.findUnique({
    where: {
      id,
      isAdmin: true,
    },
  });
  return !!result;
}

export async function getLevel(
  userRoles: string[] | undefined
): Promise<string> {
  if (!userRoles) {
    return "";
  }
  const roles = new Set(userRoles);
  if (roles.has("guru")) {
    return "guru";
  } else if (roles.has("expert")) {
    return "expert";
  } else if (roles.has("easy")) {
    return "easy";
  }
  return "";
}

export function checkAuthenticated(accessToken: string | undefined) {
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }
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

export async function listExpertiseLevels() {
  const levels = await db.expertiseLevel.findMany({
    select: {
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return levels.map((level) => level.name);
}

export async function assignExpertiseLevel(userId: string, level: string) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      expertiseLevels: {
        connect: {
          name: level,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function unassignExpertiseLevel(userId: string, level: string) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      expertiseLevels: {
        disconnect: {
          name: level,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function setPreferredExpertiseLevel(userId: string, level: string) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      preferredExpertiseLevel: level,
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

export async function setBartenderToken(userId: string, token: string, expireAt: Date) {
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
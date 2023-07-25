import { db } from "~/utils/db.server";
import { compare, hash } from "bcryptjs";

export interface User {
  readonly id: string;
  readonly email: string;
  readonly roles: {
    readonly name: string;
  }[];
}

const userSelect = {
  id: true,
  email: true,
  roles: {
    select: {
      name: true,
    },
  },
} as const;

export async function register(email: string, password: string) {
  const roles = await firstUserShouldBeAdmin();
  const passwordHash = await hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      roles,
      passwordHash,
    },
    select: userSelect,
  });
  return user;
}

async function firstUserShouldBeAdmin() {
  const userCount = await db.user.count();
  const roles =
    userCount === 0
      ? {
          connect: {
            name: "admin",
          },
        }
      : undefined;
  return roles;
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
  const roles = await firstUserShouldBeAdmin();
  const user = await db.user.upsert({
    where: {
      email: email,
    },
    create: {
      email: email,
      roles,
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

export async function verifyIsAdmin(userId: string) {
  const result = await db.user.findUnique({
    where: {
      id: userId,
      roles: {
        some: {
          name: "admin",
        },
      },
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

export async function listRoles() {
  const roles = await db.role.findMany({
    select: {
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return roles.map((role) => role.name);
}

export async function assignRole(userId: string, roleId: string) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      roles: {
        connect: {
          name: roleId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function unassignRole(userId: string, roleId: string) {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      roles: {
        disconnect: {
          name: roleId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

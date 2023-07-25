import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    // TODO use createMany when postgresql is used
    getRoles().map(async (role) => {
      return db.role.create({
        data: {
          name: role,
        },
      });
    })
  );
}

seed();

function getRoles() {
  return ["admin", "guru", "expert", "easy"];
}

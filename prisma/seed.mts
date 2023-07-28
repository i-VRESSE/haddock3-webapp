import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    // TODO use createMany when postgresql is used
    getExpertiseLevels().map(async (name) => {
      return db.expertiseLevel.create({
        data: {
          name,
        },
      });
    })
  );
}

seed();

function getExpertiseLevels() {
  return ["guru", "expert", "easy"];
}

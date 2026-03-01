import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "password123";
  const hash = await bcrypt.hash(password, 12);

  const result = await prisma.user.updateMany({
    where: {
      passwordHash: {
        not: {
          startsWith: "$2",
        },
      },
    },
    data: {
      passwordHash: hash,
    },
  });

  console.log(`Updated ${result.count} users with valid password hash.`);
  console.log(`All seed users can now log in with password: ${password}`);
  console.log("");
  console.log("Test accounts:");
  console.log("  Admin:    admin@leagueshop.com / password123");
  console.log("  Merchant: merchant1@example.com / password123");
  console.log("  User:     alice@example.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

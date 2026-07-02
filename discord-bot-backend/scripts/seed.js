import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

async function main() {
  const adminUser = 'admin';
  const adminPass = 'password';

  console.log(`Checking if admin user exists...`);
  
  const existingUser = await prisma.user.findUnique({
    where: { username: adminUser }
  });

  if (existingUser) {
    console.log(`User '${adminUser}' already exists. Skipping seed.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPass, salt);

  await prisma.user.create({
    data: {
      username: adminUser,
      password: hashedPassword,
      role: 'admin',
    }
  });

  console.log(`Successfully created admin user! Username: ${adminUser}, Password: ${adminPass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

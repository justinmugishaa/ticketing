const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123', // normally, you'd hash this
      role: 'user',
    },
  });

  // Create a sample ticket for that user
  await prisma.ticket.create({
    data: {
      title: 'Sample Ticket',
      description: 'This is a sample ticket for testing.',
      userId: user.id,
    },
  });

  console.log('✅ Seeded sample data successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  

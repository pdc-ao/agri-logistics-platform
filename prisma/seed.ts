import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@agriconnect.ao',
      passwordHash: adminPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
      country: 'Angola',
      city: 'Luanda',
      isVerified: true,
      verificationStatus: 'VERIFIED',
    },
  });

  // Create producer
  const producerPassword = await bcrypt.hash('producer123', 10);
  const producer = await prisma.user.create({
    data: {
      username: 'producer1',
      email: 'producer@agriconnect.ao',
      passwordHash: producerPassword,
      fullName: 'João Silva',
      role: 'PRODUCER',
      country: 'Angola',
      city: 'Huambo',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      producerDetails: {
        create: {
          farmName: 'Fazenda Esperança',
          farmDescription: 'Produção orgânica de vegetais',
        },
      },
    },
  });

  // Create sample product
  await prisma.productListing.create({
    data: {
      producerId: producer.id,
      title: 'Tomates Frescos',
      description: 'Tomates orgânicos cultivados sem pesticidas',
      category: 'Vegetais',
      quantityAvailable: 500,
      unitOfMeasure: 'kg',
      pricePerUnit: 350,
      currency: 'AOA',
      status: 'Active',
      locationAddress: 'Huambo',
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Company settings (single)
  const existing = await prisma.companySettings.findFirst();
  if (!existing) {
    await prisma.companySettings.create({
      data: {
        name: 'Dev.AGSmart',
        timezone: 'America/Colombia/Bogota',
        currency: 'COP',
        safeMode: true,
      },
    });
  }

  // Admin user
  const adminEmail = 'admin@devagsmart.local';
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        passwordHash: hash,
        role: 'OWNER',
      },
    });
    console.log('Admin created:', adminEmail, '/ Admin123!');
  }

  // Default assistant
  const asst = await prisma.assistant.findFirst();
  if (!asst) {
    await prisma.assistant.create({
      data: {
        name: 'Asistente de Ventas',
        objective: 'Atender consultas y ventas por WhatsApp e Instagram',
        tone: 'amable y profesional',
        status: 'DRAFT',
        version: 1,
      },
    });
  }

  console.log('Seed done.');
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1); });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create a Super Admin (Global)
    const superAdminEmail = 'admin@raktasahayog.com';
    const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

    if (!existingSuperAdmin) {
        const superAdmin = await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: superAdminEmail,
                password: hashedPassword,
                phone: '+9779800000000',
                role: 'ADMIN',
                emailVerified: true,
                adminProfile: {
                    create: {
                        region: 'Global',
                        specialization: 'System Administrator'
                    }
                }
            },
        });
        console.log(`✅ Created Super Admin: ${superAdminEmail}`);
    } else {
        console.log(`ℹ️ Super Admin already exists: ${superAdminEmail}`);
    }


    console.log('✅ Seeding complete! Super Admin verified.');
    console.log('🔑 Default Password: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const orgs = await prisma.organization.findMany();
        console.log('Organizations:', orgs.map(o => ({ id: o.id, name: o.name })));

        const users = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            include: { adminProfile: true }
        });
        console.log('Admins:', users.map(u => ({
            id: u.id,
            email: u.email,
            orgId: u.adminProfile?.organizationId
        })));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();

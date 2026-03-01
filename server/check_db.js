const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const campaign = await prisma.campaign.findUnique({
        where: { id: '1730f612-35f4-464b-a774-c2d599e49c51' },
        include: { donations: true }
    });
    console.log("Campaign from DB:", JSON.stringify(campaign, null, 2));

    const allDonations = await prisma.campaignDonation.findMany();
    console.log("All Donations in DB:", JSON.stringify(allDonations, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());

import { Request, Response } from 'express';
import { PrismaClient, BloodGroup, BloodUnitStatus } from '@prisma/client';

const prisma = new PrismaClient();

const normalizeBloodGroup = (bg: string): string | null => {
    const map: { [key: string]: string } = {
        'A+': 'A_POS',
        'A-': 'A_NEG',
        'B+': 'B_POS',
        'B-': 'B_NEG',
        'AB+': 'AB_POS',
        'AB-': 'AB_NEG',
        'O+': 'O_POS',
        'O-': 'O_NEG'
    };
    // Check if it's already in Enum format (A_POS etc)
    if (Object.values(BloodGroup).includes(bg as BloodGroup)) return bg;
    return map[bg] || null;
};

// Get inventory for a specific admin's Organization
export const getMyRegionInventory = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        let organizationId = req.user?.organizationId;

        // Fallback: Check AdminProfile if not in token
        if (!organizationId) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId },
                select: { organizationId: true }
            });
            organizationId = adminProfile?.organizationId;
        }

        if (!organizationId) {
            res.status(403).json({ success: false, error: 'Access denied. No Organization linked.' });
            return;
        }

        // Fetch Org details for response
        const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

        // 1. Get Aggregate Inventory (Stock)
        const inventory = await prisma.bloodInventory.findMany({
            where: { organizationId },
            orderBy: { bloodGroup: 'asc' }
        });

        // 2. Get Required Blood (Pending Requests)
        const requiredStats = await prisma.donationRequest.groupBy({
            by: ['bloodGroup'],
            where: {
                organizationId,
                status: 'PENDING'
            },
            _sum: { requestedUnits: true }
        });

        // Format required stats for easier frontend consumption
        const required = requiredStats.map(stat => ({
            bloodGroup: stat.bloodGroup,
            quantity: stat._sum.requestedUnits || 0
        }));

        // 3. Get Recent Blood Units (Detailed View)
        const recentUnits = await prisma.bloodUnit.findMany({
            where: { organizationId },
            include: { donor: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json({
            success: true,
            data: inventory, // Stock
            required,        // Requirements
            recentUnits,
            organization
        });

    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get Detailed History for a Blood Group
export const getInventoryDetails = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { bloodGroup } = req.params;
        const userId = req.user?.id;

        let organizationId = req.user?.organizationId;

        if (!organizationId) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId },
                select: { organizationId: true }
            });
            organizationId = adminProfile?.organizationId;
        }

        if (!organizationId) {
            res.status(403).json({ success: false, error: 'Unauthorized. No Organization linked.' });
            return;
        }

        // Fetch Org Location if needed for default, though we usually use stock location
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { location: true }
        });

        const normalizedBg = normalizeBloodGroup(decodeURIComponent(bloodGroup));
        if (!normalizedBg) {
            res.status(400).json({ success: false, error: 'Invalid blood group' });
            return;
        }

        const targetBg = normalizedBg as BloodGroup;

        // 1. Current Stock Stats
        const stock = await prisma.bloodInventory.findFirst({
            where: {
                organizationId,
                bloodGroup: targetBg
            }
        });

        // 2. Unit History (All units ever processed for this group)
        const history = await prisma.bloodUnit.findMany({
            where: {
                organizationId,
                bloodGroup: targetBg
            },
            include: {
                donor: { select: { name: true, email: true } },
                usedFor: {
                    include: {
                        user: { select: { name: true } } // Show who received it
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            stock: stock || { quantity: 0, bloodGroup, location: organization?.location || 'Unknown' },
            history
        });

    } catch (error) {
        console.error('Get details error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Record a new Donation (Creates BloodUnit + Updates Aggregate)
export const addDonation = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { donorId, bloodGroup, volume, expiryDate } = req.body;
        const userId = req.user?.id;

        let orgId = req.user?.organizationId;

        if (!orgId) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId },
                select: { organizationId: true }
            });
            orgId = adminProfile?.organizationId;
        }

        if (!orgId) {
            res.status(403).json({ success: false, error: 'Access denied. No Organization linked.' });
            return;
        }

        // Fetch Org for location fallback
        const adminProfileForLoc = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { location: true }
        });
        const vol = Number(volume) || 450;

        // Default expiry: 42 days for Whole Blood
        const dischargeDate = expiryDate ? new Date(expiryDate) : new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);

        // Transaction: Create Unit, Update Donor, Update Aggregate
        await prisma.$transaction(async (tx) => {
            // 1. Create Blood Unit
            const unit = await tx.bloodUnit.create({
                data: {
                    donorId,
                    organizationId: orgId,
                    bloodGroup: bloodGroup as BloodGroup,
                    volume: vol,
                    status: 'AVAILABLE',
                    expiryDate: dischargeDate
                }
            });

            // 2. Update Donor Profile
            const donorProfile = await tx.donorProfile.findUnique({ where: { userId: donorId } });
            if (donorProfile) {
                await tx.donorProfile.update({
                    where: { userId: donorId },
                    data: {
                        lastDonationDate: new Date(),
                        totalDonations: { increment: 1 },
                        nextEligibleDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000) // +56 days gap
                    }
                });
            }

            // 3. Update Aggregate Inventory (Upsert)
            const existingInv = await tx.bloodInventory.findFirst({
                where: { organizationId: orgId, bloodGroup: bloodGroup as BloodGroup }
            });

            if (existingInv) {
                await tx.bloodInventory.update({
                    where: { id: existingInv.id },
                    data: { quantity: { increment: 1 } }
                });
            } else {
                await tx.bloodInventory.create({
                    data: {
                        organizationId: orgId,
                        bloodGroup: bloodGroup as BloodGroup,
                        quantity: 1,
                        location: adminProfileForLoc?.location || 'Unknown',
                        expiryDate: dischargeDate // Placeholder for aggregate expiry
                    }
                });
            }
        });

        res.status(201).json({ success: true, message: 'Donation recorded successfully' });

    } catch (error) {
        console.error('Add donation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Manually Adjust Inventory (Correction)
export const updateInventory = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { bloodGroup, quantity, expiryDate } = req.body;
        const userId = req.user?.id;

        let organizationId = req.user?.organizationId;

        if (!organizationId) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId },
                select: { organizationId: true }
            });
            organizationId = adminProfile?.organizationId;
        }

        if (!organizationId) {
            res.status(403).json({ success: false, error: 'Access denied. No Organization linked.' });
            return;
        }

        // Upsert Aggregate
        const existing = await prisma.bloodInventory.findFirst({
            where: {
                bloodGroup: bloodGroup as BloodGroup,
                organizationId
            }
        });

        if (existing) {
            const updated = await prisma.bloodInventory.update({
                where: { id: existing.id },
                data: {
                    quantity: existing.quantity + Number(quantity),
                    expiryDate: expiryDate ? new Date(expiryDate) : existing.expiryDate
                }
            });
            res.json({ success: true, data: updated, message: 'Inventory updated' });
        } else {
            // Need org details for location if creating new
            const org = await prisma.organization.findUnique({ where: { id: organizationId } });

            const created = await prisma.bloodInventory.create({
                data: {
                    bloodGroup: bloodGroup as BloodGroup,
                    quantity: Number(quantity),
                    organizationId,
                    location: org?.location || 'Unknown',
                    expiryDate: new Date(expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                }
            });
            res.status(201).json({ success: true, data: created, message: 'Initial inventory created' });
        }

    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
// Mark Unit(s) as Used (Save Life)
export const markUnitAsUsed = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { unitId, bloodGroup, quantity = 1 } = req.body;
        const userId = req.user?.id;
        const organizationId = req.user?.organizationId;

        if (!organizationId) {
            res.status(403).json({ success: false, error: 'Unauthorized' });
            return;
        }

        let unitsToProcess: any[] = [];

        // Strategy 1: Specific Unit ID
        if (unitId) {
            const unit = await prisma.bloodUnit.findUnique({
                where: { id: unitId },
                include: { donor: { include: { donorProfile: true } } }
            });
            if (unit && unit.status === 'AVAILABLE') unitsToProcess.push(unit);
        }
        // Strategy 2: Batch / FIFO by Blood Group
        else if (bloodGroup) {
            const bg = normalizeBloodGroup(bloodGroup) as BloodGroup;
            unitsToProcess = await prisma.bloodUnit.findMany({
                where: {
                    organizationId,
                    bloodGroup: bg,
                    status: 'AVAILABLE'
                },
                orderBy: { createdAt: 'asc' }, // FIFO: Oldest first
                take: Number(quantity),
                include: { donor: { include: { donorProfile: true } } }
            });

            if (unitsToProcess.length < Number(quantity)) {
                res.status(400).json({
                    success: false,
                    error: `Not enough stock. Requested: ${quantity}, Available: ${unitsToProcess.length}`
                });
                return;
            }
        }

        if (unitsToProcess.length === 0) {
            res.status(404).json({ success: false, error: 'No available blood units found matching criteria' });
            return;
        }

        // Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Mark All as USED
            const ids = unitsToProcess.map(u => u.id);
            await tx.bloodUnit.updateMany({
                where: { id: { in: ids } },
                data: { status: 'USED' }
            });

            // 2. Decrement Stock
            // Assuming all are same blood group if batch, or specific unit
            // Note: If unitId used, likely only 1. If batch, all same BG.
            const targetBg = unitsToProcess[0].bloodGroup;
            const count = unitsToProcess.length;

            const inventory = await tx.bloodInventory.findFirst({
                where: { organizationId, bloodGroup: targetBg }
            });

            if (inventory) {
                await tx.bloodInventory.update({
                    where: { id: inventory.id },
                    data: { quantity: { decrement: count } }
                });
            }

            // 3. Update Donor Stats (Lives Saved) logic
            for (const unit of unitsToProcess) {
                if (!unit.donor) continue;
                // Try to increment livesSaved on a history record
                const history = await tx.donationHistory.findFirst({
                    where: {
                        donorId: unit.donor.donorProfile?.id,
                        date: {
                            gte: new Date(unit.createdAt.getTime() - 1000 * 60 * 60 * 24), // generous 24h window
                            lte: new Date(unit.createdAt.getTime() + 1000 * 60 * 60 * 24)
                        }
                    }
                });

                if (history) {
                    await tx.donationHistory.update({
                        where: { id: history.id },
                        data: { livesSaved: { increment: 1 } }
                    });
                }
            }
        });

        // 4. Send Emails (Async, outside transaction)
        // Group by donor to avoid spamming if multiple units from same donor (rare but possible in theory)
        const uniqueDonors = new Map();
        unitsToProcess.forEach(u => {
            if (u.donor?.email) uniqueDonors.set(u.donor.email, u.donor);
        });

        const { sendEmail } = require('../utils/email.utils');
        for (const [email, donor] of uniqueDonors) {
            await sendEmail(
                email,
                'Your Donation Saved a Life! - Raktasahayog',
                `<div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #e63946;">You are a Hero! 🦸</h1>
                    <p>Dear <strong>${donor.name}</strong>,</p>
                    <p>We are thrilled to inform you that your blood donation has been used to save a patient's life.</p>
                    <p>Thank you for making a difference.</p>
                    <br/>
                    <p><strong>The Raktasahayog Team</strong></p>
                </div>`
            );
        }

        res.json({
            success: true,
            message: `Successfully processed ${unitsToProcess.length} unit(s). Donors notified.`
        });

    } catch (error) {
        console.error('Mark used error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
